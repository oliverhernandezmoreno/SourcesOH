Record example:

```jsx
import TTable from '@app/components/utils/TTable';
const histHeaders = ["header1", "header2"];
const histData = [["row1col1", "row1col2"], ["row2col1", "row2col2"]];
<Record title="Historial de alertas"
    table={<TTable headers={ histHeaders } rowData={ histData } />}
    buttonText="Ver todo el historial de alertas" />
```
