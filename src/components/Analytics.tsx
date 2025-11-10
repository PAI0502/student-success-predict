import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Analytics = () => {
  // Sample data - in real implementation, this would come from your backend
  const riskDistribution = [
    { name: "Low Risk", value: 120, color: "hsl(var(--accent))" },
    { name: "Medium Risk", value: 45, color: "hsl(var(--chart-4))" },
    { name: "High Risk", value: 18, color: "hsl(var(--destructive))" },
  ];

  const attendanceVsPerformance = [
    { attendance: "0-60%", pass: 15, fail: 35 },
    { attendance: "60-80%", pass: 45, fail: 15 },
    { attendance: "80-100%", pass: 95, fail: 5 },
  ];

  const featureImportance = [
    { feature: "Internal Marks", importance: 92 },
    { feature: "Attendance", importance: 85 },
    { feature: "Class Participation", importance: 67 },
    { feature: "Engagement Index", importance: 58 },
    { feature: "Cultural Activities", importance: 42 },
    { feature: "Sports Activities", importance: 38 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">183</CardTitle>
            <CardDescription>Total Students Analyzed</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl text-accent">87.4%</CardTitle>
            <CardDescription>Model Accuracy</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl text-destructive">18</CardTitle>
            <CardDescription>High Risk Students</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Current cohort risk levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance vs Performance</CardTitle>
            <CardDescription>Pass/Fail rates by attendance bracket</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceVsPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="attendance" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pass" fill="hsl(var(--accent))" name="Pass" />
                <Bar dataKey="fail" fill="hsl(var(--destructive))" name="Fail" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Importance</CardTitle>
          <CardDescription>
            Model feature weights - which factors matter most for predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="feature" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="importance" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
