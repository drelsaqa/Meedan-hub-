# Meedan Hub Security Specification

## 1. Data Invariants
1. All member preferences (`/users/{userId}`) and private PII (`/users/{userId}/private/info`) can only be read or written by the authenticated owner (`request.auth.uid == userId`) with a verified email token.
2. Admin access (`isAdmin()`) requires BOTH `request.auth.token.email_verified == true` AND either membership in `/admins/{uid}` or the bootstrapped admin email `a01119697113@gmail.com`.
3. Support tickets (`/supportTickets/{ticketId}`) can only be created by verified users for themselves (`userId == request.auth.uid`, `status == 'open'`, no `adminReply`). Only admins can transition ticket status (`open` -> `in_progress` -> `resolved`) or set `adminReply`.
4. Once a `SpaceBooking` or `SupportTicket` reaches its terminal state (`cancelled` or `resolved`), non-admin updates are strictly rejected.
5. `list` queries on `/bookings`, `/enrollments`, `/mentorBookings`, `/eventRsvps`, and `/supportTickets` enforce `resource.data.userId == request.auth.uid || isAdmin()`.

## 2. Adversarial Test Payloads ("Dirty Dozen")
1. **Privilege Escalation (Ticket Reply)**: Regular user creating `/supportTickets/t1` with `adminReply: "Refund approved"` -> `PERMISSION_DENIED`.
2. **Status Forgery (Ticket)**: Regular user creating `/supportTickets/t1` with `status: "resolved"` -> `PERMISSION_DENIED`.
3. **Self-Admin Promotion**: Regular user creating `/admins/attacker-uid` -> `PERMISSION_DENIED`.
4. **Email Spoofing Admin**: User with unverified email token matching admin email -> `PERMISSION_DENIED`.
5. **Cross-User Ticket Read**: Regular user reading another user's `/supportTickets/t2` -> `PERMISSION_DENIED`.
6. **Regular User Ticket Update**: Regular user attempting to update `status` or `adminReply` on their own ticket -> `PERMISSION_DENIED`.
7. **Shadow Field Injection**: Creating `/supportTickets/t1` with extra field `priority: "urgent"` -> `PERMISSION_DENIED`.
8. **Identity Spoofing (Booking)**: Creating `/bookings/b1` with `userId: "victim-uid"` -> `PERMISSION_DENIED`.
9. **Terminal State Reopen**: Reopening a `cancelled` booking back to `confirmed` -> `PERMISSION_DENIED`.
10. **PII Cross-Read**: Reading `/users/victim-uid/private/info` as another user -> `PERMISSION_DENIED`.
11. **Client-Spoofed Timestamp**: Creating `/supportTickets/t1` with backdated `createdAt` -> `PERMISSION_DENIED`.
12. **Foreign Space Release**: Non-admin deleting `/occupiedSpaces/D05` owned by another user -> `PERMISSION_DENIED`.
