Step 1: Prepare Angular App for Production

Build your Angular app:

ng build --configuration production


The build output will be in:

dist/<your-app-name>/


Make a note of this folder path—it’s what Azure will serve.

Step 2: Push Code to GitHub

Make sure your Angular app is in a GitHub repository.

Commit all changes including angular.json and package.json.

Push to a branch (usually main or master).

Step 3: Create Azure Static Web App

Go to Azure Portal → Create a resource → Static Web App.

Fill in details:

Subscription: your Azure subscription

Resource Group: create or select existing

Name: e.g., hrconnect-ui

Region: closest to your users

Plan Type: Free (good for testing)

Deployment Details:

Source: GitHub

Repository: select your repo

Branch: main/master

Build Presets: Angular

App location: / (or where angular.json is)

Output location: dist/<your-app-name>

Click Review + Create, then Create.

Step 4: Configure GitHub Workflow

Azure will automatically create a .github/workflows/azure-static-web-apps.yml file.

This workflow builds and deploys your Angular app whenever you push to the selected branch.

Example snippet:

app_location: "/" # App source code path
api_location: "" # If you have a backend API, otherwise empty
output_location: "dist/hrconnect" # Angular build output folder

Step 5: Access Your App

Once deployment is complete:

Azure provides a URL like:

https://hrconnect-ui.azurestaticapps.net


This is the URL you will use in your Teams Adaptive Card deep link.

Step 6: Configure Routing for Angular SPA

In angular.json, make sure your build options include:

"outputPath": "dist/hrconnect",
"index": "src/index.html",
"baseHref": "/"


This ensures Angular SPA routing works correctly in Azure Static Web Apps.

Optional: create routes.json if you have deep links inside Teams:

{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ]
}

Step 7: Update Adaptive Card Deep Link

Use your hosted URL in graph_service.py:

teams_link = get_teams_deep_link("https://hrconnect-ui.azurestaticapps.net/mood")


Employees clicking the “Update Mood Metrics” button in Teams will open your Angular app directly inside Teams.

✅ Result:

Angular app is hosted on Azure.

HR can trigger notifications.

Employees receive Teams Adaptive Card → click → Angular app opens inside Teams tab.

If you want, I can also provide the complete updated .env + graph_service.py + HR panel Angular button all ready for copy-paste and testing end-to-end.

Do you want me to do that next?