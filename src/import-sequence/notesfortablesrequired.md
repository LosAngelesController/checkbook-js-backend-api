# For Each vendor


## 
Calculate the
- top departments

SUM(dollar_amount), departmnet

INDEX by vendor, dollar_amount

- top account

SUM(dollar_amount), account_name GROUP BY vendor_name

- top funds

SUM(dollar_amount), fund_name GROUP BY Vendor_name

## Primary Time series chart

- Per day series of transactions GROUPED BY

vendor_name,transaction_date and then

-- departments

```sql
CREATE TABLE vendorovertimechartdept AS (
	SELECT sum(dollar_amount), COUNT(*), transaction_date, vendor_name, department_name FROM losangelescheckbook
	GROUP BY vendor_name, transaction_date, department_name
)
```

-- account_name
-- fund_name
