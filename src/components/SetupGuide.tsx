import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Database, Rocket, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const SetupGuide = () => {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Setup Instructions
        </CardTitle>
        <CardDescription>
          Follow these steps to run the complete ML system with Python backend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Code className="h-4 w-4" />
          <AlertDescription>
            This frontend connects to a Python Flask/FastAPI backend. The backend files are provided
            in the <code className="bg-muted px-1 rounded">backend/</code> directory.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold mb-1">Install Python Dependencies</h4>
              <code className="block bg-muted p-3 rounded text-sm">
                cd backend
                <br />
                pip install -r requirements.txt
              </code>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold mb-1">Generate Sample Data</h4>
              <code className="block bg-muted p-3 rounded text-sm">
                python generate_data.py
              </code>
              <p className="text-sm text-muted-foreground mt-2">
                Creates sample_students.csv with 200+ synthetic student records
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold mb-1">Train ML Models</h4>
              <code className="block bg-muted p-3 rounded text-sm">
                python train_model.py
              </code>
              <p className="text-sm text-muted-foreground mt-2">
                Trains models and saves to models/ directory with evaluation metrics
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold mb-1">Start Backend API</h4>
              <code className="block bg-muted p-3 rounded text-sm">
                python app.py
              </code>
              <p className="text-sm text-muted-foreground mt-2">
                Launches Flask API on http://localhost:5000
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              5
            </div>
            <div>
              <h4 className="font-semibold mb-1">Run Frontend (This App)</h4>
              <code className="block bg-muted p-3 rounded text-sm">
                npm run dev
              </code>
              <p className="text-sm text-muted-foreground mt-2">
                Access the UI at http://localhost:8080
              </p>
            </div>
          </div>
        </div>

        <Alert className="bg-accent/10 border-accent">
          <Rocket className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Start:</strong> All backend Python files, Jupyter notebooks, and setup
            instructions are included. Check the backend/ folder for complete implementation.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-4 pt-4">
          <Button variant="outline" className="w-full">
            <Database className="h-4 w-4 mr-2" />
            View Sample Data
          </Button>
          <Button variant="outline" className="w-full">
            <Code className="h-4 w-4 mr-2" />
            API Documentation
          </Button>
          <Button variant="outline" className="w-full">
            <Rocket className="h-4 w-4 mr-2" />
            Deploy Guide
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SetupGuide;
