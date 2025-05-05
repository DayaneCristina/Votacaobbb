package metrics

import (
	"runtime"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/shirou/gopsutil/cpu"
)

var (
	VotesCounter = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "votes_counter",
			Help: "Total number of votes",
		},
		[]string{"option_id"},
	)

	ResponseTimeHistogram = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "response_time_seconds",
			Help:    "Response time of HTTP requests",
			Buckets: []float64{0.1, 0.5, 1, 2, 5},
		},
		[]string{"method", "route", "status_code"},
	)

	QueryDurationHistogram = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "query_duration_seconds",
			Help:    "Duration of database queries",
			Buckets: []float64{0.1, 0.5, 1, 2, 5},
		},
		[]string{"query_type"},
	)

	MemoryUsageGauge = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "memory_usage_bytes",
			Help: "Current memory usage",
		},
	)

	CPUUsageGauge = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "cpu_usage_percent",
			Help: "Current CPU usage",
		},
	)

	ActiveRequestsGauge = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_requests",
			Help: "Number of active HTTP requests",
		},
	)

	CacheHits = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "cache_hits_total",
			Help: "Total number of cache hits",
		},
	)
	
	CacheMisses = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "cache_misses_total",
			Help: "Total number of cache misses",
		},
	)
)

func Init(router *echo.Echo) {
	router.GET("/metrics", echo.WrapHandler(promhttp.Handler()))
	go monitorSystemResources()
}

func monitorSystemResources() {
	for {
		updateMemoryUsage()
		updateCPUUsage()

		time.Sleep(15 * time.Second)
	}
}

func updateMemoryUsage() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	MemoryUsageGauge.Set(float64(m.Alloc))
}

func updateCPUUsage() {
	usage, err := getCPUUsage()
	if err == nil {
		CPUUsageGauge.Set(usage)
	}
}

func HTTPMetricsMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		start := time.Now()
		ActiveRequestsGauge.Inc()

		err := next(c)

		duration := time.Since(start).Seconds()
		status := strconv.Itoa(c.Response().Status)

		ResponseTimeHistogram.WithLabelValues(
			c.Request().Method,
			c.Path(),
			status,
		).Observe(duration)

		ActiveRequestsGauge.Dec()
		return err
	}
}

func getCPUUsage() (float64, error) {
	percentages, err := cpu.Percent(1*time.Second, false)
	if err != nil {
		return 0, err
	}

	if len(percentages) > 0 {
		return percentages[0], nil
	}

	return 0, nil
}

func RecordQueryDuration(queryType string, duration time.Duration) {
	QueryDurationHistogram.WithLabelValues(queryType).Observe(duration.Seconds())
}
