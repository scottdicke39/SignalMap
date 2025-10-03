# 🔗 Glean API Integration Setup

This guide helps you connect SmartIntake AI to your real Handshake Glean org chart.

## 📋 Required Credentials

Add these environment variables to your `.env` file:

```bash
# Glean API Configuration
GLEAN_BASE_URL=https://joinhandshake.glean.com
GLEAN_API_KEY=your_api_key_here
# OR (alternative)
GLEAN_BEARER_TOKEN=your_bearer_token_here
```

## 🚀 How to Get Glean API Credentials

### Method 1: Glean Developer Settings
1. Go to https://joinhandshake.glean.com
2. Look for **Settings** → **Developer** or **API Access**
3. Generate an **API Key** or **Personal Access Token**
4. Copy the key to your `.env` file

### Method 2: Glean Admin Console (if you have admin access)
1. Go to https://joinhandshake.glean.com/admin
2. Navigate to **Integrations** or **API Management** 
3. Create a new **Service Account** or **API Application**
4. Copy the credentials

### Method 3: Ask Your IT/Admin Team
If you don't see developer settings:
1. Contact your Glean admin or IT team
2. Request API access for "SmartIntake AI application"
3. Ask for either an **API Key** or **Bearer Token**

## 🔧 Testing Your Setup

### Option 1: Built-in Test
The SmartIntake AI will automatically test Glean connectivity and fall back to mock data if it fails.

### Option 2: Manual Test
Create a test script to verify your credentials:

```bash
# Test your Glean connection
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://joinhandshake.glean.com/api/health
```

## 📊 How It Works

1. **With Glean Configured**: 
   - Enter "Camila Ribeiro" → Gets her real team from Glean
   - Shows actual titles, departments, direct reports

2. **Without Glean**: 
   - Falls back to smart mock data 
   - Still uses your manager name correctly
   - Generates realistic team structure

## 🔍 Common Glean API Endpoints

The integration will try these endpoints (varies by Glean setup):

- `/api/search/people` - Search for people
- `/api/orgchart/person/{id}` - Get org chart
- `/directory/api/people/search` - Alternative search
- `/api/v1/search` - General search API

## 🐛 Troubleshooting

### "Glean not configured" message:
- Check your `.env` file has the correct variables
- Restart your development server after adding env vars

### "Failed to connect to Glean":
- Verify your API key is correct
- Check if your Glean instance URL is right
- Test the API key with a simple curl command

### "No person found":
- Try different name formats ("Camila Ribeiro", "Camila", "C Ribeiro")
- Check if the person exists in your Glean directory

## 🎯 Expected Results

When working correctly, entering "Camila Ribeiro" should return:
```json
{
  "manager": "Camila Ribeiro - Senior Operations Manager",
  "department": "Operations",
  "team": [
    "John Smith - Operations Analyst",
    "Sarah Johnson - Senior Program Manager"
  ],
  "crossFunc": [
    "Mike Chen - Product Manager",
    "Lisa Rodriguez - Engineering Lead"
  ]
}
```

## 🔄 Fallback Behavior

If Glean integration fails, the system will:
1. Log the error for debugging
2. Return smart mock data using your manager name
3. Add `_source: "fallback"` to indicate mock data
4. Continue working normally

This ensures the SmartIntake AI always works, even if Glean is temporarily unavailable.

---

**Need Help?** 
- Check Glean documentation at your company
- Contact your IT team for API access
- Test with mock data first, then add real Glean later








