# Security Spec

## Data Invariants
1. An availability document ID must exactly match the `uid` of the authenticated user.
2. The `uid` field inside the document must match `request.auth.uid`.
3. The user must be signed in and their email must be verified.
4. Users can only create or update their own availability document.
5. All authenticated users can read the `availabilities` collection (to see the sync).

## The Dirty Dozen Payloads
1. Unauthenticated Create
2. Unverified Email Create
3. Create with mismatched UID in document path
4. Create with mismatched UID in document data
5. Create with missing fields
6. Create with extra fields (ghost fields)
7. Create with non-timestamp `createdAt`
8. Update another user's document
9. Update `uid` field to a different user
10. Update with invalid `dates` (not a list, or list sizes > 365)
11. Read without authentication
12. Update `createdAt` field (immortal field violation)
