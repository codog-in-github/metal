<template>
  <div>
    <div style="margin-bottom: 10px">
      <va-date-input
        @update:modelValue="$nextTick(loadData)"
        :month-names="monthNames"
        :weekday-names="weekdayNames"
        label="时间"
        v-model="dates"
      />
    </div>
    <div class="num">
      <va-card stripe stripe-color="success">
        <va-card-title>累计收入</va-card-title>
        <va-card-content>
          <span class="strong">{{incomeTotal[0]}}</span>
          <span>.{{incomeTotal[1]}}</span>
          <span class="unit">元</span>
        </va-card-content>
      </va-card>
      <va-card stripe stripe-color="success">
        <va-card-title>剩余库存（现货）</va-card-title>
        <va-card-content>
          <span class="strong">{{stockTotal['1'][0]}}</span>
          <span>.{{stockTotal['1'][1]}}</span>
          <span class="unit">吨</span>
        </va-card-content>
      </va-card>
      <va-card stripe stripe-color="success">
        <va-card-title>剩余库存（期货）</va-card-title>
        <va-card-content>
          <span class="strong">{{stockTotal['2'][0]}}</span>
          <span>.{{stockTotal['2'][1]}}</span>
          <span class="unit">吨</span>
        </va-card-content>
      </va-card>
    </div>
    <va-card stripe stripe-color="success">
      <va-card-title>日收益统计</va-card-title>
      <va-card-content ref="chartRoot" class="chart-root">
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
import moment from 'moment';
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';

const chartRoot = ref(null);

const monthNames = [
  '一月', '二月', '三月', '四月',
  '五月', '六月', '七月', '八月',
  '九月', '十月', '十一月', '十二月',
];
const weekdayNames = [
  '日','一','二','三','四','五', '六'
];

const dates = ref({
  start: moment().startOf('month').toDate(),
  end: moment().endOf('month').toDate(),
});

// 总收入
const incomeTotal = ref(['0', '00']);
const stockTotal = ref({
  '1': ['0', '00'],
  '2': ['0', '00']
});

function createReport (data) {
  const dataGroups = {};
  function dataDoGroup (row) {
    const day = moment(row['create_time']).format('YYYY-MM-DD');
    const typeKey = `${row['goods_id']}-${row['goods_type']}`;
    if(!dataGroups[day]) {
      dataGroups[day] = {
        '1-1': {},
        '2-1': {},
        '1-2': {},
      };
    }
    if(dataGroups[day][typeKey][row['price']]) {
      dataGroups[day][typeKey][row['price']] += row['total'];
    } else {
      dataGroups[day][typeKey][row['price']] = row['total'];
    }
  }
  const allStock = {
    '1': {
      total: 0,
      value: 0,
    },
    '2': {
      total: 0,
      value: 0,
    },
  };
  data.forEach(dataDoGroup);
  const dataByDay = Object.keys(dataGroups).map(date => {
    let income = 0;
    const dayData = dataGroups[date];
    function countTotal (key) {
      return Object.values(dayData[key])
        .reduce((prev, curr) => prev + curr, 0);
    }
    function countValue (key) {
      return Object.keys(dayData[key])
        .reduce((result, price) => result + dayData[key][price] * price, 0);
    }
    const total1 = countTotal('1-1') + countTotal('2-1');
    const total2 = countTotal('1-2');
    const value1 = countValue('1-1') + countValue('2-1');
    const value2 = countValue('1-2');
    const surplusTotal = total1 + total2;
    if(surplusTotal === 0) {
      income = value1 + value2;
    } else if(surplusTotal * total1 > 0) {
      // surplusTotal 同号 即 库存来源为现货
      income = value1 / total1 * total2 + value2;
      const surplusValue = value1 + value2 - income;
      if(surplusTotal * allStock['1'].total > 0) {
        allStock['1'].total +=  surplusTotal;
        allStock['1'].value +=  surplusValue;
      } else {
        const disTotal = surplusTotal + allStock['1'].total;
        allStock['1'].total += disTotal;
        if(disTotal === 0) {
          income += allStock['1'].value + surplusValue;
          allStock['1'].value = 0;
        } else if(disTotal * allStock['1'].total > 0) {
          income += allStock['1'].value / allStock['1'].total * surplusTotal + surplusValue;
          allStock['1'].value = allStock['1'].value / allStock['1'].total * disTotal;
        } else {
          income += allStock['1'].total * surplusValue / surplusTotal + allStock['1'].total;
          allStock['1'].value = surplusValue / surplusTotal * disTotal;
        }
      }
    } else {
      // 库存来源为期货
      income = value1 +  value2 / total2 * total1;
      const surplusValue = value1 + value2 - income;
      if(surplusTotal * allStock['2'].total > 0) {
        allStock['2'].total +=  surplusTotal;
        allStock['2'].value +=  surplusValue;
      } else {
        const disTotal = surplusTotal + allStock['2'].total;
        allStock['2'].total += disTotal;
        if(disTotal === 0) {
          income += allStock['2'].value + surplusValue;
          allStock['2'].value = 0;
        } else if(disTotal * allStock['2'].total > 0) {
          income += allStock['2'].value / allStock['2'].total * surplusTotal + surplusValue;
          allStock['2'].value = allStock['2'].value / allStock['2'].total * disTotal;
        } else {
          income += allStock['2'].total * surplusValue / surplusTotal + allStock['2'].total;
          allStock['2'].value = surplusValue / surplusTotal * disTotal;
        }
      }
    }
    return { income, date };
  });
  incomeTotal.value = dataByDay.reduce((sum, curr) => sum - curr.income, 0).toFixed('2').split('.');
  stockTotal.value['1'] = allStock['1'].total.toFixed(2).split('.');
  stockTotal.value['2'] = allStock['2'].total.toFixed(2).split('.');
  setOption(dataByDay);
}

function loadData () {
  if(!dates.value.start || !dates.value.end) {
    return;
  }
  const sql = `SELECT * FROM "business" WHERE ("create_time" >= ${
    dates.value.start.valueOf()
  } AND "create_time" <= ${
    moment(dates.value.end).endOf('day').valueOf()
  }) ORDER BY "create_time"`;
  electron.each(sql).then(createReport);
}
let setOption = () => {};
onMounted(() => {
  const chart = echarts.init(chartRoot.value.$el);
  // 绘制图表
  setOption = data => {
    console.log('data', data);
    chart.setOption({
      tooltip: {},
      xAxis: {
        data: data.map(item => item.date.substring(5))
      },
      yAxis: {},
      series: {
        name: '收入',
        type: 'bar',
        data: data.map(item => -item.income)
      }
    });
  };
  loadData();
});

</script>

<style lang="scss" scoped>
.num{
  display: flex;
  gap: 10px;
  margin-bottom: 10px;

  & > * {
    flex: 1 1 auto;
  }

  .strong {
    font-size: 40px;
  }

  .unit {
    margin-left: 5px;
  }
}

.chart-root{
  height: 480px;
}
</style>