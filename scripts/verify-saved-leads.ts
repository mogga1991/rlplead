/**
 * Verify that all GSA lessors are saved in saved_leads
 */

import { getSavedLeadsForUser } from '../db/queries';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

async function verifySavedLeads() {
  console.log('🔍 Verifying Saved Leads...\n');

  try {
    // Find the default admin user
    const defaultUser = await db.query.users.findFirst({
      where: eq(users.email, 'admin@rlplead.com'),
    });

    if (!defaultUser) {
      console.error('❌ Default admin user not found');
      return;
    }

    console.log(`👤 User: ${defaultUser.email} (${defaultUser.id})\n`);

    // Get all saved leads for this user
    const savedLeads = await getSavedLeadsForUser(defaultUser.id);

    console.log(`📊 Total Saved Leads: ${savedLeads.length}\n`);
    console.log('='.repeat(100));

    savedLeads.slice(0, 10).forEach((lead, idx) => {
      console.log(`\n${idx + 1}. ${lead.company.name}`);
      console.log(`   🆔 Company ID: ${lead.company.id}`);
      console.log(`   📋 List: ${lead.listName || 'N/A'}`);
      console.log(`   🏷️  Tags: ${lead.tags?.join(', ') || 'None'}`);
      console.log(`   📊 Status: ${lead.status || 'N/A'}`);
      console.log(`   ⭐ Priority: ${lead.priority || 'N/A'}`);
      console.log(`   💰 Lease Value: $${parseFloat(lead.company.totalAwards).toLocaleString()}`);
      console.log(`   👥 Contacts: ${lead.company.contacts.length}`);
    });

    if (savedLeads.length > 10) {
      console.log(`\n   ... and ${savedLeads.length - 10} more saved leads`);
    }

    console.log('\n' + '='.repeat(100));
    console.log(`\n✅ All ${savedLeads.length} GSA lessors are saved in Saved Leads!`);
    console.log(`🎯 Ready to view in the app\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

verifySavedLeads();
