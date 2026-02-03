import { NextRequest, NextResponse } from 'next/server';
import { saveLeadForUser, getSavedLeadsForUser } from '@/db/queries';

/**
 * GET /api/saved-leads
 * Get all saved leads for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-admin-default';

    const savedLeads = await getSavedLeadsForUser(userId);

    return NextResponse.json({ savedLeads, count: savedLeads.length });
  } catch (error) {
    console.error('Error fetching saved leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved leads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved-leads
 * Save a lead for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      userId = 'default-user',
      listName,
      tags,
      status,
      priority,
      notes,
      nextAction,
      nextActionDate,
    } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    const savedLead = await saveLeadForUser(companyId, userId, {
      listName,
      tags,
      status,
      priority,
      notes,
      nextAction,
      nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
    });

    return NextResponse.json({ lead: savedLead });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    );
  }
}
