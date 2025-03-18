import React from "react";
import { Table, TableProps, List, Card } from "antd";

interface ResponsiveTableProps<T> extends TableProps<T> {}

function ResponsiveTable<T extends object>(props: ResponsiveTableProps<T>) {
//   const isMobile = useMediaQuery({ maxWidth: 768 });

//   if (!isMobile) {
//     return <Table {...props} />;
//   }

  return (
    <List
      dataSource={props.dataSource}
      renderItem={(item) => (
        <Card style={{ marginBottom: 8 }}>
          {props.columns?.map((col) => (
            <div key={col.key || col.dataIndex?.toString()}>
              <strong>{col.title}:</strong> {item[col.dataIndex as keyof T]}
            </div>
          ))}
        </Card>
      )}
    />
  );
}

export default ResponsiveTable;
