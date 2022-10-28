```sql
SELECT vendor_name, sum(dollar_amount) FROM losangelescheckbook GROUP BY vendor_name;
```

took over 17 seconds to run! a fast query index is required

okay, save the sql as another result

```sql
CREATE TABLE vendor_summed AS
  SELECT vendor_name, sum(dollar_amount) FROM losangelescheckbook GROUP BY vendor_name;
  ```

create an index for it too

```sql
CREATE INDEX vendor_summed_sum_order
ON vendor_summed (sum);
```

  to update:

  ```sql
  insert into vendor_summed (vendor_name,sum) SELECT vendor_name, sum(dollar_amount) FROM losangelescheckbook GROUP BY vendor_name;
  ```

query it like

```sql
SELECT * FROM vendor_summed ORDER BY sum desc LIMIT 100 OFFSET 1000;
```

TOO SLOW!
```sql
SELECT * FROM losangelescheckbook WHERE vendor_name ilike '%' || 'the glue' || '%'
```

okay 
make this index
```sql
CREATE INDEX vendorquickindex ON losangelescheckbook  USING GIST (vendor_name); 
```

``` sql
CREATE INDEX vendorquicksearch ON  losangelescheckbook USING gin (vendor_name gin_trgm_ops);
```

Make an index on the vendor sum
```sql
CREATE INDEX vendor_summed_namequicksearch ON losangelescheckbook USING gin (vendor_name gin_trgm_ops);
```

query fast autocomplete!
```sql
SELECT * FROM vendor_summed WHERE vendor_name ILIKE '%$1%' ORDER BY sum desc;