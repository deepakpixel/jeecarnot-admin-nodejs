ASSIGN MENTOR/ CHANGE MENTOR
REQ: {mentorid,menteeid}
RES: {type:success,description:"MENTOR ASSIGNED/CHNAGED SUCCESSFULLY"}

### ASSIGN MENTOR

- if mentor is already assgned return {type:failed,description:mentor is already assigned}
- add mentor id in mentee profile
- maintain the list of past mentors for each mentee, so add pastMentors[] in mentee schema. with assignedDate field set to current time
- add mentee id in mentor profile
- notify both via email/sms/notifications
- remove every entry from assignMentors collection
  - assignmentors colection stores ids of mentees to whome mentor is to be assinged
    SCHEMA:{\_id,menteeid}

### CHANGE MENTOR

CHANGE MENTOR

- remove mentee from old mentor's profile
- replace current mentorid from mentee's profile to new mentorid
- add new mentor in past mentors
- notify new mentor and mentee

### fetch mentee profile

GET profile/mentee/:id

### fetch mentor profile

GET profile/mentor/:id

### Send notifications

{
accountType:mentee/mentor // to whome it needs to be send
id // to whome it needs to be send
title
description
image
}

### Fetch feedbacks

{
type:all/critical/pending/resolved
page:1
perpage:10
}
RES: {results:[{...},{...}],totalresults}

### fetch mentors list

return the name, college, number of mentees under mentor (need to add mentees[] in mentor schema) of each mentor from mentor collection

### approve reject material req

post {matReqid,status:approve/reject}

    send notification to mentee
        {title: Material issued or Material request rejected
        description: Physics: Electrostats (Theory)
        }
