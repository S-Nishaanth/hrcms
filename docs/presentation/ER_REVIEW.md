# ER/EER review

Reviewed against `database/01_schema.sql`, `database/02_logic.sql` and the account creation/update code in `backend/src/admin.js`.

## 1. Schema and key coverage

All 13 tables and all 18 foreign keys appear across slides 2–5. `check-er.mjs` compares the diagram relationship manifest with the CREATE TABLE statements, including nullability and single-column uniqueness. It checks that no FK is missing or repeated in the manifest.

Run with Node: `node docs/presentation/check-er.mjs`.

## 2. Cardinality and EER semantics

- End labels count instances of that entity per instance at the opposite end. `1` means exactly one; `0..1` means optional one; `0..*` means zero or many.
- USERS has a **partial, disjoint specialization into the three displayed subtypes**. ADMIN accounts remain in USERS and have no subtype table. A standard `d` circle and single superclass line make this explicit. API transactions enforce role matching and disjointness; the FKs alone do not.
- USER_PHONE has composite PK(user_id,phone_no). A user can have zero or many phone rows. The phone number alone is not unique.
- Nullable UNIQUE hostel_block.warden_id gives optional one-to-one management in both directions.
- Allocation links describe all historical rows. The one-active-allocation rule and room capacity are additional constraints, not a one-to-one historical relationship.
- assigned_staff_id and changed_by are nullable. A complaint/log may therefore have no staff/actor reference.
- FEEDBACK uses complaint_id as both PK and FK, so a complaint has zero or one feedback row.
- A complaint can have zero or many logs under FK constraints. The insert trigger creates the initial log during normal workflow. Workflow guarantees are documented separately from FK minimum participation.
- ROOM and COMPLAINT_LOG use implemented surrogate keys. They are not depicted with hypothetical weak-entity keys from an earlier conceptual design.
- Each staff member has exactly one block and one complaint category. Either parent can have zero or many staff members.

## 3. Exported diagram review

All four diagram slides were rendered individually and inspected for connector routes, end-label placement, entity/attribute spelling, key labels, line intersections and text clipping. Selected attributes are explicitly identified as a subset of the full DDL. The other review topics and the 18-slide scope are preserved.

The final PowerPoint is checked for structural integrity, geometry and successful import by Artifact Tool. The diagrams remain editable native slide objects.
