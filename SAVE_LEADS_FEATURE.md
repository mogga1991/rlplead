# Save Leads Feature - User Guide

## Overview

You can now save leads directly from your search results! This feature allows you to build your pipeline by selecting promising GSA lessors and saving them for follow-up.

## 🎯 How to Save Leads

### Method 1: Individual Save
1. **Search** for GSA lessors using the search filters
2. **Review** the results in the table
3. **Click "Save"** button on any row you want to keep
4. The button changes to **"Saved"** with a green checkmark ✓

**What Happens:**
- Lead is added to your Saved Leads list
- Auto-tagged with: GSA, Real Estate, Search Result
- Priority set based on opportunity score (High if ≥50, Medium if <50)
- Status set to "new"
- Includes notes with company name and lease value

### Method 2: Bulk Save (Save Multiple at Once)
1. **Select** multiple leads by clicking the checkboxes
2. **Click "Save Selected (X)"** button at the bottom
3. **Confirm** the save operation
4. Get success message showing how many leads were saved

**Smart Features:**
- Automatically skips leads you've already saved
- Shows count of selected leads in real-time
- Prevents duplicate saves

## 🎨 Visual States

### Save Button States:
- **"Save"** (Outline button) - Ready to save
- **"Saving..."** (Loading) - Processing your save
- **"Saved"** (Green solid) - Already in your Saved Leads ✓

### Icons:
- 📑 **Bookmark** - Unsaved lead
- ✅ **BookmarkCheck** - Saved lead

## 📊 What Gets Saved

When you save a lead, it includes:

**Company Information:**
- Company name, UEI, location
- Total lease value
- Number of leases
- Property types (Office, Parking, Land)
- Lease states

**Automatic Tags:**
- GSA
- Real Estate
- Search Result

**Priority:**
- **High** - Opportunity score ≥ 50
- **Medium** - Opportunity score < 50

**Status:** New

**Notes:**
Example: "Saved from search - CENTRE MARKET BUILDING LLC with $3.0M in lease value"

## 🔍 Example Workflow

### Scenario: Finding Top Office Space Lessors in New York

1. **Filter Search:**
   - Property Type: Office Space
   - State: New York
   - Click "Find Lessors"

2. **Review Results:**
   - Table shows all NY office lessors
   - Sort by "Score" to see best opportunities first
   - Click rows to see full details in right panel

3. **Save Best Leads:**

   **Option A - Save One by One:**
   - See a great lead? Click "Save"
   - Button turns green "Saved" ✓
   - Move to next lead

   **Option B - Save Multiple:**
   - Check boxes next to 5 promising leads
   - Click "Save Selected (5)" at bottom
   - Confirm and done!

4. **View Saved Leads:**
   - Navigate to `/saved-leads` page
   - See all your saved GSA lessors
   - Click any to see full details with LinkedIn photos
   - Export to CSV for outreach

## 💡 Pro Tips

### Maximize Your Pipeline:

1. **Use Filters First**
   - Narrow down to your target market
   - Property type, location, lease value
   - This ensures you only save qualified leads

2. **Check Opportunity Scores**
   - Sort by "Score" column
   - Focus on scores 50+ for high-priority leads
   - Lower scores may still be valuable for specific reasons

3. **Review Details Before Saving**
   - Click row to open detail panel
   - Check contact information availability
   - Verify lease portfolio matches your needs

4. **Bulk Save for Efficiency**
   - Select top 10-20 leads from search
   - Save all at once
   - Process and qualify later in Saved Leads page

5. **Export and Outreach**
   - Go to Saved Leads page
   - Click "Export CSV"
   - Import to your CRM or email tool
   - Start outreach with enriched contact data

## 🎯 Best Practices

### When to Save a Lead:

✅ **Good Reasons to Save:**
- Opportunity score ≥ 25
- Active in your target states
- Property types match your offering
- Multi-state operator (more opportunities)
- Recent contract activity
- Contact information available

❌ **Reasons to Skip:**
- Duplicate of already saved lead (button will show "Saved")
- Too small (< $50K total lease value)
- Wrong property type
- No contact information and hard to reach

### Organizing Your Saved Leads:

After saving from search:
1. Visit `/saved-leads` page
2. Update status as you progress:
   - New → Contacted → Qualified → Converted
3. Add custom notes for each lead
4. Use tags to categorize (already auto-tagged)
5. Set priorities based on your criteria

## 📈 Tracking Your Pipeline

### Search Results Page:
- See total leads found
- See how many selected
- Save best opportunities
- Total lease value shown

### Saved Leads Page:
- Total saved: Count of all saved leads
- New leads: Count of "new" status
- Contacted: Count of "contacted" status
- Qualified: Count of "qualified" status

### Export to CSV:
- All company data
- All contact information (names, emails, phones)
- Opportunity scores and insights
- Recommended approaches

## 🚀 Quick Start

**First Time Using:**

1. Click "Find Lessors" on home page
2. Review results
3. Click "Save" on 3-5 leads
4. Navigate to "Saved Leads" page
5. See your saved leads with full details
6. Click "Export CSV" to download

**Daily Workflow:**

1. Morning: Run new search with different filters
2. Save 5-10 promising leads
3. Afternoon: Review saved leads, add notes
4. Update status as you contact companies
5. Export updated list for CRM sync

## 🔧 Technical Details

**API Endpoint:** `POST /api/saved-leads`

**Save Location:** Neon PostgreSQL database

**Data Persistence:** Permanent (until manually deleted)

**User Association:** Currently uses default admin user

**Duplicate Prevention:** Frontend tracks saved leads in session, backend prevents duplicate entries by company ID

## 📝 Troubleshooting

**"Failed to save lead" error:**
- Check internet connection
- Refresh page and try again
- Lead may already be in database

**Button stuck on "Saving...":**
- Wait 5 seconds for network request
- If stuck, refresh page
- Lead may have been saved successfully

**Can't see saved leads:**
- Navigate to `/saved-leads` page
- Check that you're using the same browser session
- Refresh the page

## 🎉 Summary

You now have a complete lead capture workflow:

1. **Search** - Find GSA lessors with filters
2. **Save** - Click "Save" or select multiple and "Save Selected"
3. **Manage** - View all saved leads in one place
4. **Enrich** - See LinkedIn photos and contact data
5. **Export** - Download CSV for outreach
6. **Track** - Update status and add notes
7. **Convert** - Turn leads into customers!

Happy lead hunting! 🎯
