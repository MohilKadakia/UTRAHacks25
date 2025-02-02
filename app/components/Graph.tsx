import { Dimensions, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { LineChart, BarChart } from "react-native-gifted-charts";  
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  dataX: {value: number}[];
  dataY: {value: number}[];
  maxY: number;
}>;

export default function Graph({
  dataX,
  dataY,
  maxY,
}: Props) {
  return (
    <View
      style={{
        paddingVertical: 100,
        paddingLeft: 20,
        backgroundColor: '#1C1C1C',
        maxWidth: 480,
      }}>
      <LineChart
        areaChart
        curved
        data={dataY}
        rotateLabel
          width={300}
          hideDataPoints
          spacing={20}
          color="#00ff83"
          thickness={2}
          startFillColor="rgba(20,105,81,0.3)"
          endFillColor="rgba(20,85,81,0.01)"
          startOpacity={0.9}
          endOpacity={0.2}
          initialSpacing={0}
          noOfSections={6}
          maxValue={Math.round((maxY * 1.15) / 50)*50}
          yAxisColor="white"
          yAxisThickness={0}
          rulesType="solid"
          rulesColor="gray"
          yAxisTextStyle={{color: 'gray'}}
          yAxisSide='right'
          xAxisColor="lightgray"

        pointerConfig={{
          pointerStripUptoDataPoint: true,
          pointerStripColor: 'lightgray',
          pointerStripWidth: 2,
          strokeDashArray: [2, 5],
          pointerColor: 'lightgray',
          radius: 4,
          pointerLabelWidth: 100,
          pointerLabelHeight: 120,

          pointerLabelComponent: items => {
            return (
              <View
                style={{
                  height: 48,
                  width: 100,
                  backgroundColor: '#282C3E',
                  borderRadius: 4,
                  justifyContent:'center',
                  paddingLeft: 16,
                  marginLeft: 32,
                }}>

                  <ThemedText>{Math.round(items[0].value)}</ThemedText>
              </View>
            );
          },
        }}
      />
    </View>

  );
}
