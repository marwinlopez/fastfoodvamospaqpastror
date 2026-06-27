import { Skeleton } from "@rneui/base";
import React from "react";
import { Grid, Row } from "react-native-easy-grid";

const GridEmpty = () => {
  return (
    <Grid>
      <Row style={{ height: 70 }}>
        <Skeleton height={69} />
      </Row>
      <Row style={{ height: 70 }}>
        <Skeleton height={69} />
      </Row>
      <Row style={{ height: 70 }}>
        <Skeleton height={69} />
      </Row>
    </Grid>
  );
};

export default GridEmpty;
