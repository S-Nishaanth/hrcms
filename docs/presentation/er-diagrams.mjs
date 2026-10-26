// Each FK is represented exactly once across four editable ER/EER slides.
// Cardinality is written at each entity end: instances per opposite entity.
export const relationships = [
 ['user_phone','user_id','users','user_id',2,'1','0..*'],
 ['student','student_id','users','user_id',2,'1','0..1'],
 ['warden','warden_id','users','user_id',2,'1','0..1'],
 ['maintenance_staff','staff_id','users','user_id',2,'1','0..1'],
 ['hostel_block','warden_id','warden','warden_id',3,'0..1','0..1'],
 ['room','block_id','hostel_block','block_id',3,'1','0..*'],
 ['room','type_code','room_type','type_code',3,'1','0..*'],
 ['room_allocation','student_id','student','student_id',3,'1','0..*'],
 ['room_allocation','room_id','room','room_id',3,'1','0..*'],
 ['complaint','student_id','student','student_id',4,'1','0..*'],
 ['complaint','room_id','room','room_id',4,'1','0..*'],
 ['complaint','category_id','complaint_category','category_id',4,'1','0..*'],
 ['complaint','assigned_staff_id','maintenance_staff','staff_id',4,'0..1','0..*'],
 ['complaint_log','complaint_id','complaint','complaint_id',4,'1','0..*'],
 ['feedback','complaint_id','complaint','complaint_id',4,'1','0..1'],
 ['maintenance_staff','block_id','hostel_block','block_id',5,'1','0..*'],
 ['maintenance_staff','category_id','complaint_category','category_id',5,'1','0..*'],
 ['complaint_log','changed_by','users','user_id',5,'0..1','0..*'],
];
export function createErBuilders({base,text,node,route,note,line}) {
 const green='#1F4D3B',muted='#60735E';
 const card=(s,label,x,y,w=68)=>text(s,label,x,y,w,25,18,true,green,'cardinality-'+label);
 const edge=(s,points,a,ax,ay,b,bx,by)=>{route(s,points,'',0,0);card(s,a,ax,ay);card(s,b,bx,by);};
 const legend=s=>text(s,'End labels = instances per opposite entity.  0..* = zero or many.  Selected attributes shown.',65,640,1150,28,18,false,muted,'er-legend');
 const sources='database/01_schema.sql;database/02_logic.sql;backend/src/admin.js';
 return [
 (p,n)=>{
  const s=base(p,'EER model: identity and subtypes',n);
  node(s,'USERS',['PK user_id','UQ email','full_name, password_hash, role'],460,180,360,145);
  node(s,'USER_PHONE',['PK/FK user_id','PK phone_no'],60,180,270,145);
  edge(s,[[330,250],[460,250]],'0..*',337,214,'1',430,214);
  node(s,'STUDENT',['PK/FK student_id','UQ reg_no','department, year_of_study'],65,460,290,145);
  node(s,'WARDEN',['PK/FK warden_id','designation, office_room'],495,460,290,145);
  node(s,'MAINTENANCE_STAFF',['PK/FK staff_id','FK block_id, category_id','shift'],925,460,290,145);
  line(s,640,325,640,365);
  s.shapes.add({geometry:'ellipse',name:'disjoint-specialization',position:{left:615,top:365,width:50,height:50},fill:'#FFFFFF',line:{fill:'#72916C',width:1.5}});
  text(s,'d',631,373,25,32,25,true,green);
  route(s,[[640,415],[640,435],[210,435],[210,460]],'',0,0);
  line(s,640,435,640,460);
  route(s,[[640,435],[1070,435],[1070,460]],'',0,0);
  text(s,'Partial, disjoint specialization',740,350,480,30,23,true,green);
  text(s,'d = disjoint. Single superclass line = partial.',740,390,475,30,18,false,muted);
  text(s,'ADMIN stays in USERS. The API enforces matching roles and subtype creation.',65,615,1150,26,20,false,muted);
  note(s,'The three displayed subtypes form a PARTIAL specialization of USERS because ADMIN users have no subtype table. The d circle denotes disjoint specialization. The single line from USERS denotes partial participation. Each subtype row has exactly one USERS row through its PK/FK. A USERS row has zero or one row in each subtype table. API transactions create exactly the subtype matching a non-admin role and prohibit role changes. SQL foreign keys alone do not enforce disjointness or role matching. USER_PHONE has composite PK(user_id,phone_no): each phone row belongs to exactly one user, while a user may have zero or many phone rows. A phone number need not be globally unique. Attributes are selected for readability, not a full data dictionary.',sources);
  return s;
 },
 (p,n)=>{
  const s=base(p,'ER model: accommodation',n);
  node(s,'WARDEN',['PK warden_id'],65,205,255,105);
  node(s,'HOSTEL_BLOCK',['PK block_id','FK/UQ warden_id (nullable)','UQ block_name, gender_type'],435,185,320,155);
  node(s,'ROOM',['PK room_id','FK block_id, type_code','UQ (block_id, room_number)'],910,185,305,155);
  node(s,'STUDENT',['PK student_id','UQ reg_no'],65,500,255,115);
  node(s,'ROOM_ALLOCATION',['PK allocation_id','FK student_id, room_id','academic_year, status'],435,480,320,155);
  node(s,'ROOM_TYPE',['PK type_code','capacity, annual_fee'],910,500,305,115);
  edge(s,[[320,255],[435,255]],'0..1',324,223,'0..1',383,266);
  edge(s,[[755,260],[910,260]],'1',765,225,'0..*',851,225);
  edge(s,[[320,555],[435,555]],'1',327,520,'0..*',383,565);
  edge(s,[[910,315],[835,315],[835,410],[595,410],[595,480]],'1',873,281,'0..*',607,448);
  edge(s,[[1060,500],[1060,340]],'1',1077,466,'0..*',1077,350);
  text(s,'Allocation cardinalities include history. Active capacity is enforced by rules.',65,370,735,28,20,true,green);
  legend(s);
  note(s,'Five FKs: hostel_block.warden_id, room.block_id, room.type_code, room_allocation.student_id and room_allocation.room_id. At each end, the label counts instances of that entity per instance at the other end. The nullable UNIQUE warden FK makes management optional one-to-one in both directions. Every room has exactly one block and one room type. Each block/type can have zero or many rooms. Each allocation belongs to exactly one student and one room. Each student/room may have zero or many historical allocations. One ACTIVE allocation per student is a separate generated unique-key rule; room capacity and block gender are checked by routines/triggers. ROOM uses surrogate room_id and alternate unique key(block_id,room_number), so it is not drawn as a weak entity in this implemented relational ER model. Inactive entities retain their relationships.',sources);
  return s;
 },
 (p,n)=>{
  const s=base(p,'ER model: complaints',n);
  node(s,'STUDENT',['PK student_id'],65,195,245,95);
  node(s,'ROOM',['PK room_id'],65,365,245,95);
  node(s,'COMPLAINT_CATEGORY',['PK category_id','sla_hours'],65,515,245,115);
  node(s,'COMPLAINT',['PK complaint_id','FK student_id, room_id','FK category_id','FK assigned_staff_id (nullable)','title, priority, status','created_at, resolved_at'],470,240,355,305);
  node(s,'MAINTENANCE_STAFF',['PK staff_id'],980,195,235,95);
  node(s,'COMPLAINT_LOG',['PK log_id','FK complaint_id'],980,365,235,115);
  node(s,'FEEDBACK',['PK/FK complaint_id','rating, comments'],980,520,235,115);
  edge(s,[[310,242],[390,242],[390,285],[470,285]],'1',326,208,'0..*',412,252);
  edge(s,[[310,412],[470,412]],'1',326,378,'0..*',412,378);
  edge(s,[[310,570],[395,570],[395,505],[470,505]],'1',327,578,'0..*',412,469);
  edge(s,[[980,242],[900,242],[900,285],[825,285]],'0..1',915,208,'0..*',834,252);
  edge(s,[[825,412],[980,412]],'1',838,378,'0..*',918,378);
  edge(s,[[825,505],[900,505],[900,585],[980,585]],'1',837,468,'0..1',918,550);
  legend(s);
  note(s,'Six FKs: complaint.student_id, complaint.room_id, complaint.category_id, complaint.assigned_staff_id, complaint_log.complaint_id and feedback.complaint_id. Every complaint requires exactly one student, room and category. Each of those parents may have zero or many complaints. A complaint has zero or one assigned staff member, and a staff member can have zero or many complaints. Each log belongs to exactly one complaint. The FK allows zero or many logs per complaint, while the AFTER INSERT trigger creates the initial log in normal workflow. Each feedback row belongs to exactly one complaint. Its shared PK/FK allows at most one feedback row per complaint; resolved complaints may await feedback. A trigger requires RESOLVED and owner attribution for feedback, then closes the complaint. These workflow conditions are not additional FKs. complaint_log uses standalone log_id, not a composite log_no weak-entity key.',sources);
  return s;
 },
 (p,n)=>{
  const s=base(p,'ER model: staff and audit attribution',n);
  node(s,'HOSTEL_BLOCK',['PK block_id'],65,215,310,110);
  node(s,'MAINTENANCE_STAFF',['PK/FK staff_id','FK block_id','FK category_id'],485,190,310,165);
  node(s,'COMPLAINT_CATEGORY',['PK category_id'],905,215,310,110);
  edge(s,[[375,270],[485,270]],'1',385,235,'0..*',429,282);
  edge(s,[[795,270],[905,270]],'0..*',801,282,'1',870,235);
  node(s,'USERS',['PK user_id','full_name, role'],230,480,330,125);
  node(s,'COMPLAINT_LOG',['PK log_id','FK changed_by (nullable)','remark, changed_at'],770,455,340,165);
  edge(s,[[560,542],[770,542]],'0..1',577,503,'0..*',700,503);
  text(s,'Each staff member has one block and one category. Each log may name one actor.',65,385,1150,36,24,true,green);
  legend(s);
  note(s,'The remaining three FKs are maintenance_staff.block_id, maintenance_staff.category_id and complaint_log.changed_by. Each staff row requires one block and one category; either parent may have zero or many staff members. changed_by is nullable and ON DELETE SET NULL, so each log has zero or one user actor and each user can author zero or many logs. This is attribution, not the student who raised the complaint. The separate complaint_log.complaint_id link is on the complaint slide. Staff-to-USERS PK/FK is on the specialization slide. All 13 tables and 18 FKs are covered across the four diagrams. Keys and minimum participation follow DDL; role matching and block/category assignment checks are additional application/procedure constraints.',sources);
  return s;
 }
 ];
}
