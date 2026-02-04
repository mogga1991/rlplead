import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveLeadForUser, getSavedLeadsForUser, getAllSavedLeads } from '@/db/queries';
import { handleAPIError } from '@/lib/error-handler';
import { AuthenticationError, ValidationError, DatabaseError } from '@/lib/errors';
import { savedLeadSchema, getValidationErrorMessage, getValidationErrorField } from '@/lib/validation';
import { checkCSRF } from '@/lib/csrf';

/**
 * GET /api/saved-leads
 * Get all saved leads (globally accessible to all users)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    // Get ALL saved leads (not filtered by user - globally accessible)
    const savedLeads = await getAllSavedLeads();

    return NextResponse.json({ savedLeads, count: savedLeads.length });
  } catch (error) {
    return handleAPIError(error, { endpoint: 'saved-leads/get' });
  }
}

/**
 * POST /api/saved-leads
 * Save a lead for authenticated user
 * CSRF Protection: Required for all POST requests
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF validation FIRST
    await checkCSRF(request);

    const session = await auth();

    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    // Parse request body
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid request body. Expected JSON.');
    }

    // Validate with Zod schema
    const validationResult = savedLeadSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const errorMessage = getValidationErrorMessage(validationResult.error);
      const errorField = getValidationErrorField(validationResult.error);
      throw new ValidationError(errorMessage, errorField);
    }

    const validatedData = validationResult.data;

    const savedLead = await saveLeadForUser(validatedData.companyId, session.user.id, {
      listName: validatedData.listName,
      tags: validatedData.tags,
      status: validatedData.status,
      priority: validatedData.priority,
      notes: validatedData.notes,
      nextAction: validatedData.nextAction,
      nextActionDate: validatedData.nextActionDate ? new Date(validatedData.nextActionDate) : undefined,
    });

    return NextResponse.json({ lead: savedLead });
  } catch (error) {
    return handleAPIError(error, { endpoint: 'saved-leads/post' });
  }
}
