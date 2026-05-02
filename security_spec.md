# MedVault Security Specification

## Data Invariants
1. A user profile must have a valid role ('patient' or 'doctor').
2. Medical records must belong to a valid patient.
3. Access to medical records is restricted to the patient who owns them, or a doctor IF the patient has `sharingEnabled: true`.

## The "Dirty Dozen" Payloads (Denial Tests)
1. Someone trying to create a user with an admin role (if admin existed).
2. A patient trying to edit someone else's profile.
3. A doctor trying to view a patient's records when `sharingEnabled` is false.
4. A patient trying to upload a record with a fake `patientId`.
5. An unauthenticated user trying to read any record.
6. A user trying to delete someone else's record.
7. A patient trying to change their own role after creation.
8. A user trying to inject a 1MB string into the `name` field.
9. A doctor trying to create a medical record for a patient.
10. A user trying to update `createdAt` field.
11. A doctor trying to enable sharing for a patient.
12. A user trying to set a document ID longer than 128 chars.

## Test Runner (Logic)
- `users/{userId}`: `read` IF `isOwner()`. `allow list` ONLY for admins (if any) or restricted. Doctors can `get` a patient by ID if sharing is on.
- `records/{recordId}`: `read` IF `isOwner()` OR (`isDoctor()` AND `patientSharingEnabled(patientId)`).

Wait, the instructions say `firestore.rules` should be robust.

I'll write `firestore.rules`.
Note: "Doctors can only view data via shared access".
The doctor dashboard has a "View Patient" button that leads to `/doctor/patient/:id`.
So the rule for `records` should check the `users` document of the `patientId`.
