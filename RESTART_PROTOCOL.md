# Restart Protocol - Webflow MCP Setup

## When you restart Claude Code, paste this message:

```
I need to reconnect to the Webflow MCP server. Here's our context:

1. Read SESSION_CONTEXT.md - we're building an AiPhlo Webflow template
2. Webflow MCP is configured in ~/.claude/settings.json but not connecting
3. OAuth was completed (I authorized Webflow access)
4. Check if Webflow MCP server is now available with ListMcpResourcesTool
5. If available, let's start building the homepage with Tenebre shoppable gallery
6. If not available, troubleshoot the MCP connection

Goal: Use MCP to directly build in Webflow (not manual instructions)
```

## What Claude should do first:

1. **Check for Webflow MCP server:**
   - Run `ListMcpResourcesTool` to see if "webflow" server appears
   - Should see webflow tools alongside the Indeed tools

2. **If Webflow appears:**
   - Test a simple Webflow API call (like list sites)
   - Start building homepage structure
   - Focus on Tenebre shoppable gallery system

3. **If Webflow doesn't appear:**
   - Check `~/.claude/settings.json` configuration
   - Try running `npx -y mcp-remote https://mcp.webflow.com/sse` again
   - Check for any error messages
   - May need to investigate MCP server logs or Claude Code MCP connection

## Expected Webflow MCP Tools:

Once connected, you should see tools like:
- `webflow_list_sites` - List all accessible Webflow sites
- `webflow_get_site` - Get site details
- `webflow_create_element` - Create page elements
- `webflow_create_collection` - Create CMS collections
- `webflow_add_item` - Add CMS items
- And many more for building/modifying Webflow sites

## Build Goal (once MCP works):

**Homepage with Tenebre Shoppable Gallery:**
- Hero section
- Tenebre toggle switch (OFF/ON)
- Gallery grid that switches between two modes
- Each item has hover price overlay
- Click opens lightbox with "Add to Cart"
- Dark theme, gold (#d4af37) and green (#6fb886) accents
