// A small, related sample dataset for a fresh schema with 02_logic.sql loaded.
export const examples=[
 {name:'USERS and USER_PHONE',caption:'Four linked role accounts and two phone rows. Passwords are stored as bcrypt hashes.',sql:`SET @demo_hash =
 '$2b$10$FxjL3He5vrwComs.3GxatOGDJvh4JVA6UeQEdNmdQ7MRtqPYwFx2m';
INSERT INTO users
 (user_id, full_name, email, password_hash, role)
VALUES
 (1,'Hostel Administrator','admin@hrcms.edu',@demo_hash,'ADMIN'),
 (2,'Dr. R. Srinivasan','warden.a@hrcms.edu',@demo_hash,'WARDEN'),
 (5,'Ramesh Kumar','ramesh@hrcms.edu',@demo_hash,'STAFF'),
 (13,'Arjun Reddy','arjun@student.edu',@demo_hash,'STUDENT');

INSERT INTO user_phone (user_id, phone_no)
VALUES (2,'9000000002'), (13,'9000000013');`},
 {name:'WARDEN, HOSTEL_BLOCK and STUDENT',caption:'Subtype keys reuse USERS IDs. A Block is managed by warden 2; student 13 is male.',sql:`INSERT INTO warden (warden_id, designation, office_room)
VALUES (2,'Chief Warden','Office 1');

INSERT INTO hostel_block
 (block_id, block_name, gender_type, total_floors, warden_id)
VALUES (1,'A Block','MALE',4,2);

INSERT INTO student
 (student_id, reg_no, gender, department, year_of_study)
VALUES (13,'24BCE1001','MALE','Computer Science',2);`},
 {name:'ROOM_TYPE and ROOM',caption:'Two room types and two rooms. Each room references an existing block and room type.',sql:`INSERT INTO room_type (type_code, capacity, annual_fee)
VALUES ('SINGLE',1,95000), ('DOUBLE',2,75000);

INSERT INTO room
 (room_id, block_id, room_number, floor_no, type_code, has_ac)
VALUES
 (1,1,'A101',0,'DOUBLE',TRUE),
 (2,1,'A201',1,'SINGLE',FALSE);`},
 {name:'COMPLAINT_CATEGORY and MAINTENANCE_STAFF',caption:'Staff member 5 handles electrical issues in A Block on the morning shift.',sql:`INSERT INTO complaint_category
 (category_id, category_name, default_priority, sla_hours)
VALUES
 (1,'Electrical','HIGH',24),
 (2,'Plumbing','HIGH',24);

INSERT INTO maintenance_staff (staff_id, category_id, block_id, shift)
VALUES (5,1,1,'MORNING');`},
 {name:'ROOM_ALLOCATION and COMPLAINT',caption:'One active allotment and one OPEN complaint. The complaint trigger creates its first log row.',sql:`START TRANSACTION;
SET @app_user_id = 2;
CALL sp_allocate_room(13,1,'2026-27',2);

SET @app_user_id = 13;
CALL sp_raise_complaint(13,1,'Ceiling light not working',
 'The ceiling light in A101 does not turn on.','HIGH');
SET @complaint_id = LAST_INSERT_ID();
COMMIT;`},
 {name:'FEEDBACK and COMPLAINT_LOG',caption:'One feedback entry closes the complaint. Triggers record five status events in COMPLAINT_LOG.',sql:`START TRANSACTION;
CALL sp_assign_complaint(@complaint_id,5,2);
CALL sp_update_status(@complaint_id,'IN_PROGRESS',5,'Checking light');
CALL sp_update_status(@complaint_id,'RESOLVED',5,'Replaced bulb');
SET @app_user_id = 13;
INSERT INTO feedback (complaint_id, rating, comments)
VALUES (@complaint_id,5,'Light works now. Thank you.');
COMMIT;

SELECT old_status, new_status, changed_by
FROM complaint_log
WHERE complaint_id = @complaint_id
ORDER BY log_id;`}
];
