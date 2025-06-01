# Resource Based Access Control

Digital Lions implements resource based access control in two ways: 
- users have limited access to perform actions, based on the permissions that are part of their role;
- users have only access to resources to based on their assigned roles.

## Roles and permissions

The following app roles are defined in Auth0:
- Admin
- Coach


## Resource filtering

### Materialized paths

Resource filtering is what we call the mechanism of returning only what a user has access to. 
A resource can be a community, a team, children, etc. To implement this in an efficient way 
Digital Lions makes use of materialized paths. Digital Lions has the following hierarchical structure of resources:
```
Implementing Partners > Communities > Teams > Children
```
From this the materialized path of a given resource is constructed as
```
/implementingPartners/<implementingPartnerID>/communities/<communityID>/teams/<teamID>/children/<childID>
```
For each of the above resource type (Implementing Partner, Community, Team, Child), the materialized path
is constructed on insertion of the record in the database in the column `resource_path`. For example,
community X with ID 2, part of implementing partner Little Lions (ID 1), has `resource_path`
```
/implementingPartners/1/communities/2
```

### Roles table

Next to the materialized paths there exists a table `roles`, which contains all user roles on a certain level. For example,
if a user with ID 1 has the role Admin on community 2, this user has a record in the roles table:

| Column | Value | Description |
|--------|--------|-------------|
| user_id | `auth0\|user123` | Auth0 user identifier |
| role | `Admin` | Role name (Admin or Coach) |
| level | `Community` | Level of assignment (Implementing Partner, Community, Team) |
| resource_path | `/implementingPartners/1/communities/2` | Materialized path of the resource |

### Filter query

The filter query uses the materialized path pattern to efficiently determine access. We compute an inner join
between the table that corresponds to the queried resource with the roles table using path-based matching:

```sql
SELECT DISTINCT resource.*
FROM resource_table resource
JOIN roles ON (
    -- Role's path is parent of resource's path (inherited access)
    roles.resource_path LIKE resource.resource_path || '/%' OR
    -- Exact path match
    roles.resource_path = resource.resource_path OR
    -- Resource's path is descendant of role's path (parent access)
    resource.resource_path LIKE roles.resource_path || '/%' OR
    resource.resource_path = roles.resource_path
)
WHERE roles.user_id = ?
```

This query enables hierarchical access where:
- A role at implementing partner level grants access to all communities and teams within it
- A role at community level grants access to all teams within that community
- A role at team level grants access only to that specific team

## Auth0 Integration

Digital Lions integrates with Auth0 for authentication and initial role definition:

### Auth0 Roles
- **Admin**: Mapped to internal Admin role with full permissions
- **Coach**: Mapped to internal Coach role with limited permissions

### Permission Mapping
The system maps Auth0 roles to internal permissions:

**Coach Role Permissions:**
- `children:read`
- `teams:read`
- `communities:read`
- `workshops:read`
- `workshops:write`

**Admin Role Permissions:**
- All Coach permissions plus:
- `children:write`
- `teams:write`
- `communities:write`
- `implementing_partners:read`
- `implementing_partners:write`
- `users:read`
- `users:write`
- `reports:read`

## Role Assignment Process

### API Endpoints
The system provides endpoints for role management:

- `GET /roles` - List available roles (Admin, Coach)
- `GET /roles/levels` - List assignment levels (Implementing Partner, Community, Team)
- `GET /roles/resources` - List available resources for a given role/level combination

### Role Scope Constraints
Role assignments are constrained by scope:
- **Admin**: Can only be assigned at Implementing Partner level
- **Coach**: Can be assigned at Community or Team level

### Assignment Workflow
1. Admin selects a user (from Auth0)
2. Admin selects a role (Admin/Coach)
3. System shows valid levels for that role
4. Admin selects specific resource at chosen level
5. System creates role record with computed resource path

## Practical Examples

### Example 1: Coach Access
User Jane is assigned Coach role at Community "Urban Lions" (ID: 5) in Implementing Partner "Little Lions" (ID: 1):

**Role Record:**
```
user_id: auth0|jane123
role: Coach
level: Community
resource_path: /implementingPartners/1/communities/5
```

**Access Results:**
- ✅ Can read/write workshops in Community 5
- ✅ Can read teams within Community 5
- ✅ Can read children in teams within Community 5
- ❌ Cannot access Community 6 or other implementing partners
- ❌ Cannot write to teams or children (no write permissions)

### Example 2: Admin Access
User Bob is assigned Admin role at Implementing Partner "Little Lions" (ID: 1):

**Role Record:**
```
user_id: auth0|bob456
role: Admin
level: Implementing Partner
resource_path: /implementingPartners/1
```

**Access Results:**
- ✅ Can read/write all resources within Implementing Partner 1
- ✅ Can manage all communities, teams, and children within it
- ✅ Can assign roles to other users in any community/team within IP 1
- ❌ Cannot access other implementing partners

### Example 3: Team-Level Coach
User Sarah is assigned Coach role at specific Team "Team Alpha" (ID: 10):

**Role Record:**
```
user_id: auth0|sarah789
role: Coach
level: Team
resource_path: /implementingPartners/1/communities/5/teams/10
```

**Access Results:**
- ✅ Can read/write workshops for Team 10 only
- ✅ Can read children in Team 10
- ❌ Cannot access other teams, even within the same community
- ❌ Cannot write to team or children records

## Technical Implementation Details

### Permission Checking
The system implements two-level permission checking:

1. **Action-Level Permissions**: Verified before any operation
```python
self.current_user.verify_permission(Permission.teams_write)
```

2. **Resource-Level Filtering**: Applied to all queries
```python
teams = self.database.teams.read_all_by_user_access(
    user_id=self.current_user.user_id
)
```

### Hierarchical Permission Inheritance
The system recursively checks permissions up the hierarchy:

```python
def has_permission_on_resource(self, permission: Permission, resource):
    if self._has_permission_on_resource(permission, resource):
        return True
    elif resource.parent is None:
        return False
    elif self.has_permission_on_resource(permission, resource.parent):
        return True
    return False
```

### Database Schema
Resource paths are computed automatically using database triggers:

**Communities:**
```sql
resource_path = '/implementingPartners/' || implementing_partner_id || '/communities/' || id
```

**Teams:**
```sql
resource_path = '/implementingPartners/' || implementing_partner_id || '/communities/' || community_id || '/teams/' || id
```

## Important Edge Cases

### 1. New User Access
**Critical:** When a new user is added to the system, they cannot perform any actions until they have a role assigned. The system will return empty results for all queries and deny all write operations.

**Impact:** New users may appear to have system access (can log in) but will see no data and receive permission errors.

**Solution:** Ensure role assignment is part of the user onboarding process.

### 2. Admin Role Escalation
**Critical:** Once someone is assigned an Admin role at any level, they gain the ability to assign roles to users in any other community or team within their scope and beyond.

**Example:** An Admin at Community level can assign roles to users in other communities within the same implementing partner, even though they cannot access those communities' data directly.

**Security Consideration:** Admin role assignment should be carefully controlled as it grants role management capabilities across the entire accessible hierarchy.

### 3. Role Deletion Impact
When a user's role is removed, they immediately lose access to all associated resources. This change takes effect immediately without requiring re-authentication.

### 4. Resource Path Consistency
The materialized path approach requires that resource paths remain consistent. If parent resources are moved or IDs change, all child resource paths must be updated accordingly.

### 5. Performance Considerations
Large hierarchies with many roles can impact query performance. The system uses database indexes on `resource_path` and `user_id` columns to optimize filtering queries.

## Benefits of This Approach

1. **Scalable**: Materialized paths enable efficient hierarchical queries without recursive CTEs
2. **Flexible**: Easy to add new resource types or adjust hierarchy levels
3. **Secure**: Multi-layer permission checking ensures both action and resource-level security
4. **Performant**: Single JOIN operations for resource filtering, avoiding N+1 query problems
5. **Maintainable**: Clear separation between roles, permissions, and resources
6. **Auditable**: Role assignments are explicitly stored and can be easily tracked

## Migration and Deployment Notes

When deploying changes to the RBAC system:
1. Database schema changes require careful migration of existing resource paths
2. Permission changes may require user re-authentication to pick up new permissions
3. Role assignment changes take effect immediately but may require cache invalidation in some cases

