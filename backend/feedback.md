# Some feedback and Notes in no particular order

- UV en Ruff zijn mooie alternatieven voor Poetry en Black en zijn echt de toekomst voor het Python ecosysteem
- Endpoints gebruikten de docstring voor documenteren van scopes.
    ```md
    **Required scopes**
    - `communities:read`
    ```
    - Endpoints documenteren met scopes kan met de Security decorator in plaats van Depends
        - https://fastapi.tiangolo.com/reference/dependencies/#security

- Validators in `ChildValidators` kunnen gedaan worden met `typing.Literal["male", "female"]` en `Field(gt=0)`
- Models use `first_name` and `last_name`, but is that how people in South Afrika are using their names? (i dont know)
    - I found this an interesting read on this topic, and you see this pattern basically everywhere now: https://blog.prototypr.io/full-name-vs-first-last-name-ux-best-practice-8c2db7178fd1
- Gebruik je de mixins in`models._metadata` ivm DRY? Imho voegt het meer complexiteit toe dan wat het aan duplicatie zou toevoegen. 
- De conventie voor Enums in Python is uppercase. Zie ook StrEnum: https://docs.python.org/3/library/enum.html#enum.StrEnum
- 
- Permission verification wordt gedaan door het `CurrentUser` model. Ik zou het logischer vinden als dat door een service of losse functie / decorator gedaan wordt. 
```python
def get_all(self) -> list:
	self.current_user.verify_permission(self.permissions.children_read)
	return self.database.children.read_all()
```


```python
@requires_permissions([self.permissions.children_read])
def get_all(self) -> list:
	return self.database.children.read_all()
```

 - Verificatie van permissions tot "Resources" gebeurd op een hoger abstractie niveau dan wat ik zou verwachten. bvb; de check of je `children:read` hebt gebeurd in de service, terwijl je zou verwachten dat dit gebeurd in de Repository omdat die verantwoordelijk is voor de resource. 
 - Dit kan je bereiken door `BaseService` gebruik te laten maken van dependency injection voor `EmailService` en `DatabaseRepositories` (`DatabaseRepositories` zelf moet dan ook DI toepassen)
	-  `current_user`  komt dan beschikbaar in die services en al je repositories.
	- `read_all_by_user_access` is dan niet meer afhankelijk van een argument op de method, maar heeft deze data in de class state, en kan daardoor ook omhoog in abstractie naar `BaseRepository`
- 