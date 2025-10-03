# How to Get Your Glean API Key

## Step 1: Visit Glean API Admin

Go to: **https://joinhandshake.glean.com/admin/api**

(You may need admin permissions - if you don't have access, ask your IT team)

## Step 2: Create a New API Token

1. Click **"Create Token"** or **"Generate API Key"**
2. Give it a name like: `Cursor MCP Access`
3. Select permissions (at minimum):
   - ✅ **Search** - Search Glean content
   - ✅ **Chat** - Use Glean chat/agents
   - ✅ (Optional) **Read Documents** - Retrieve full documents

## Step 3: Copy the Token

⚠️ **Important**: Copy the token immediately - you won't be able to see it again!

The token will look something like:
```
glean_abc123xyz456...
```

## Step 4: Add to Cursor MCP Config

Once you have the token, I'll help you add it to your `.cursor/mcp.json` file with:

```json
{
  "mcpServers": {
    "glean_default": {
      "type": "http",
      "url": "https://joinhandshake.glean.com/mcp/default",
      "headers": {
        "Authorization": "Bearer YOUR_GLEAN_API_TOKEN_HERE"
      }
    }
  }
}
```

## Step 5: Use for Both Projects

This same API key can be used for:
- ✅ Cursor MCP (development/testing)
- ✅ RecruitingBot Slack app (production)
- ✅ SmartIntake AI (production)

## Need Help?

If you don't have admin access to create API tokens:
- Contact your Glean admin
- Or ask IT to create one for you
- Mention you need it for "AI integrations and MCP access"

