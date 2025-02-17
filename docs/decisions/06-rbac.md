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

- user_id: | u |
| ------------- |
| Item1 |


### Filter query

From this, the filter query is pretty straightforward: we compute an inner join
between the table that corresponds to the queried resource with the roles table.





