```sql
CREATE TABLE vendordepartmentsummed AS (
	SELECT sum(dollar_amount), vendor_name, department_name FROM losangelescheckbook
	GROUP BY vendor_name, department_name
)
```

```sql
CREATE TABLE vendorovertimechartdept AS (
	SELECT sum(dollar_amount), COUNT(*), transaction_date, vendor_name, department_name FROM losangelescheckbook
	GROUP BY vendor_name, transaction_date, department_name
)
```