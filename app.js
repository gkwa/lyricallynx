const { useState, useEffect } = React
const {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
} = Recharts

const InternetUsageTracker = () => {
  const [data, setData] = useState([])
  const [dailyUsageData, setDailyUsageData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from the GitHub gist URL
        const response = await fetch(
          "https://gist.githubusercontent.com/taylormonacelli/5866396655738e834056f9b20e9cc081/raw/d71a09b39c2d3bd10380c23d27fac607976a3fb2/internet.json",
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const jsonData = await response.json()

        // Group by date and take the last record for each day
        const groupedByDate = {}
        jsonData.forEach((item) => {
          const date = item.date
          if (
            !groupedByDate[date] ||
            new Date(item.scrapedAt) > new Date(groupedByDate[date].scrapedAt)
          ) {
            groupedByDate[date] = item
          }
        })

        // Convert to array and sort by date
        const dailyData = Object.values(groupedByDate).sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        )

        // Enhance data with percentage and projection
        const enhancedData = dailyData.map((item) => {
          // Calculate percentage of monthly cap used
          const percentage = ((item.amount / item.total) * 100).toFixed(1)

          // For the current billing cycle, calculate projected usage
          let projection = null
          if (item.amount > 0) {
            // Skip projections for reset days
            // Find the most recent reset day
            const currentDate = new Date(item.date)
            const day = currentDate.getDate()
            const month = currentDate.getMonth()
            const year = currentDate.getFullYear()

            // Calculate days into the current cycle
            // Assuming reset is on the 1st of each month
            const daysIntoCycle = day

            // Calculate days in current month
            const daysInMonth = new Date(year, month + 1, 0).getDate()

            // Project end-of-month usage based on current rate
            const dailyRate = item.amount / daysIntoCycle
            projection = dailyRate * daysInMonth
          }

          return {
            date: item.date,
            usage: item.amount,
            total: item.total,
            percentage,
            projection,
          }
        })

        // Create daily usage data (the difference between consecutive days)
        const dailyUsage = []
        for (let i = 1; i < enhancedData.length; i++) {
          // Only calculate daily usage for days with increasing usage
          // (ignore reset days where usage drops)
          if (enhancedData[i].usage > enhancedData[i - 1].usage) {
            dailyUsage.push({
              date: enhancedData[i].date,
              dailyUsage: enhancedData[i].usage - enhancedData[i - 1].usage,
              formattedDate: formatDate(enhancedData[i].date),
            })
          } else {
            // For reset days, just record 0 or the current value if it's the first day of a cycle
            dailyUsage.push({
              date: enhancedData[i].date,
              dailyUsage: enhancedData[i].usage,
              formattedDate: formatDate(enhancedData[i].date),
            })
          }
        }

        setData(enhancedData)
        setDailyUsageData(dailyUsage)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load usage data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format dates for better display (including year)
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your usage data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-4">
        <p className="font-medium">No Data Available</p>
        <p>No internet usage data was found. Please check back later.</p>
      </div>
    )
  }

  // Get most recent data point for statistics
  const currentData = data[data.length - 1]

  // Find daily average increase for current billing cycle
  const currentCycleData = []
  let i = data.length - 1

  // Start from the most recent day and go backward until we find a reset
  while (i >= 0 && data[i].usage > 0) {
    currentCycleData.unshift(data[i])
    i--
  }

  // Calculate average daily usage for current cycle
  let avgDailyUsage = 0
  if (currentCycleData.length > 1) {
    const increases = []
    for (let j = 1; j < currentCycleData.length; j++) {
      increases.push(currentCycleData[j].usage - currentCycleData[j - 1].usage)
    }
    avgDailyUsage = increases.reduce((sum, val) => sum + val, 0) / increases.length
  } else if (currentCycleData.length === 1) {
    // If we only have one day in the cycle, use that day's usage
    avgDailyUsage = currentCycleData[0].usage
  }

  // Calculate projected month-end usage
  const today = new Date(currentData.date)
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const dayOfMonth = today.getDate()
  const daysRemaining = daysInMonth - dayOfMonth
  const projectedAdditionalUsage = avgDailyUsage * daysRemaining
  const projectedTotal = currentData.usage + projectedAdditionalUsage

  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-md">
          <p className="font-bold text-sm">{dataPoint.date}</p>
          <p className="text-blue-600 text-sm">{`Usage: ${dataPoint.usage.toFixed(2)} GB`}</p>
          <p className="text-gray-600 text-sm">{`${dataPoint.percentage}% of ${dataPoint.total} GB plan`}</p>
          {dataPoint.projection > 0 && (
            <p className="text-purple-600 text-sm mt-1">{`Projected: ${dataPoint.projection.toFixed(2)} GB`}</p>
          )}
        </div>
      )
    }
    return null
  }

  // Custom tooltip for the bar chart
  const DailyUsageTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-md">
          <p className="font-bold text-sm">{dataPoint.date}</p>
          <p className="text-green-600 text-sm">{`Daily Usage: ${dataPoint.dailyUsage.toFixed(2)} GB`}</p>
        </div>
      )
    }
    return null
  }

  // Determine projection status message
  let projectionMessage = ""
  let projectionStatusColor = "text-blue-600"

  if (projectedTotal > currentData.total) {
    projectionStatusColor = "text-blue-600"
    const extraCost = Math.ceil((projectedTotal - currentData.total) / 10) * 5 // Example: $5 per 10GB over
    projectionMessage = `Projected to use ${(projectedTotal - currentData.total).toFixed(1)} GB over plan (est. $${extraCost} extra)`
  }

  // Find max value in dataset for proper Y-axis scaling
  const maxUsage = Math.max(...data.map((item) => item.usage))
  // Set Y-axis max to 600 to ensure there's plenty of room for the reference line label
  const yAxisMax = 600

  // Find max daily usage for bar chart scaling
  const maxDailyUsage = Math.max(...dailyUsageData.map((item) => item.dailyUsage))
  const barChartYMax = Math.ceil(maxDailyUsage * 1.2) // Add 20% margin

  return (
    <div className="w-full bg-white rounded-lg shadow">
      {/* Header section with current stats */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-center mb-2">Internet Usage Tracker</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Current Usage</div>
            <div className="text-2xl font-bold text-blue-600">
              {currentData.usage.toFixed(2)} GB
            </div>
            <div className="text-sm text-gray-500">
              {currentData.percentage}% of {currentData.total} GB plan
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Daily Average</div>
            <div className="text-2xl font-bold text-orange-600">{avgDailyUsage.toFixed(2)} GB</div>
            <div className="text-sm text-gray-500">
              {(avgDailyUsage * 30).toFixed(0)} GB per month at this rate
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Month-End Projection</div>
            <div className="text-2xl font-bold text-blue-600">{projectedTotal.toFixed(2)} GB</div>
            <div className="text-sm text-gray-500">
              {((projectedTotal / currentData.total) * 100).toFixed(1)}% of your plan
            </div>
          </div>
        </div>

        {/* Projection message if needed */}
        {projectionMessage && (
          <div
            className={`mt-3 p-2 rounded text-sm ${projectionStatusColor} bg-opacity-10 text-center`}
          >
            {projectionMessage}
          </div>
        )}
      </div>

      {/* Charts section */}
      <div className="p-4">
        {/* Cumulative Usage Line Chart */}
        <h3 className="text-lg font-semibold mb-2">Cumulative Usage</h3>
        <div className="h-72 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                interval={Math.ceil(data.length / 10)}
              />
              <YAxis
                domain={[0, yAxisMax]}
                label={{ value: "GB Used", angle: -90, position: "insideLeft" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine
                y={400}
                stroke="blue"
                strokeDasharray="3 3"
                label={{
                  position: "top",
                  value: "Base Plan (400 GB)",
                  fill: "blue",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="usage"
                name="GB Used"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 1 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Usage Bar Chart */}
        <h3 className="text-lg font-semibold mb-2">Daily Usage</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedDate"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                domain={[0, barChartYMax]}
                label={{ value: "Daily GB Used", angle: -90, position: "insideLeft" }}
              />
              <Tooltip content={<DailyUsageTooltip />} />
              <Legend />
              <Bar
                dataKey="dailyUsage"
                name="Daily Usage (GB)"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Last updated: {formatDate(currentData.date)}</p>
          <p>Data shown for the last {data.length} days</p>
          <p className="mt-2">
            Data source:{" "}
            <a
              href="https://gist.github.com/taylormonacelli/5866396655738e834056f9b20e9cc081"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              GitHub Gist
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// Render the React component
ReactDOM.render(<InternetUsageTracker />, document.getElementById("app"))
