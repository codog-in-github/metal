<template>
  <va-data-table :items="items" :columns="columns" striped>
    <template #header(create_time)>
      <va-date-input
        @update:modelValue="$nextTick(loadData)"
        :month-names="monthNames"
        :weekday-names="weekdayNames"
        label="时间"
        v-model="filters.dates"
        style="width: 190px"
      />
    </template>
    <template #header(goods_id)>
      <va-select
        @update:modelValue="$nextTick(loadData)"
        clearable
        label="商品类型"
        style="width: 130px"
        v-model="filters.id"
        :options="goodsIdOptions"
      ></va-select>
    </template>
    <template #header(goods_type)>
      <va-select
        label="期货类型"
        @update:modelValue="$nextTick(loadData)"
        clearable
        v-model="filters.type"
        style="width: 130px"
        :options="goodsTypeOptions"
      ></va-select>
    </template>
    <template v-slot:cell(create_time)="{ value }" >{{ fmtDate(value) }}</template>
    <template v-slot:cell(goods_id)="{ value }" >{{ goodsIdName(value) }}</template>
    <template v-slot:cell(goods_type)="{ value }" >{{ goodsTypeName(value) }}</template>
    <template v-slot:cell(total)="{ value }" >
      <span v-if="value < 0" style="color: red;">卖出 {{ -value }}</span>
      <span v-else style="color: green;">购入 {{ value }}</span>
    </template>
  </va-data-table>
</template>

<script setup>
import { ref } from 'vue';
import moment from 'moment';
import { GOODS_ID_IMPURE, GOODS_ID_PURE, GOODS_TYPE_FUTURES, GOODS_TYPE_SPOT } from '@/constant';

const monthNames = [
  '一月', '二月', '三月', '四月',
  '五月', '六月', '七月', '八月',
  '九月', '十月', '十一月', '十二月',
];
const weekdayNames = [
  '日','一','二','三','四','五', '六'
];
const filters = ref({
  dates: {
    start: moment().startOf('month').toDate(),
    end: moment().endOf('month').toDate()
  },
  id: void 0,
  type: void 0
});

const goodsTypeOptions = [
  { text: '期货', value: GOODS_TYPE_FUTURES },
  { text: '现货', value: GOODS_TYPE_SPOT }
];

const goodsIdOptions = [
  { text: '纯铜', value: GOODS_ID_PURE },
  { text: '废铜', value: GOODS_ID_IMPURE }
];


const items = ref([]);
const columns = [
  {  key: 'create_time' },
  {  key: 'goods_id' },
  {  key: 'goods_type' },
  {  key: 'price', label: '交易单价（元）' },
  {  key: 'total', label: '交易数量（吨）' },
];

function fmtDate (time) {
  return moment(Number(time)).format('YYYY-MM-DD');
}

function goodsTypeName (type) {
  switch (Number(type)) {
  case GOODS_TYPE_FUTURES:
    return '期货';
  case GOODS_TYPE_SPOT:
    return '现货';
  }
  return '未知';
}
function goodsIdName (type) {
  switch (Number(type)) {
  case GOODS_ID_IMPURE:
    return '废铜';
  case GOODS_ID_PURE:
    return '纯铜';
  }
  return '未知';
}

function loadData () {
  const qs = [];
  let sql = 'SELECT * FROM "business"';
  if(!filters.value.dates.start || !filters.value.dates.end) {
    return;
  }
  qs.push(
    `("create_time" >= ${
      filters.value.dates.start.valueOf()
    } AND "create_time" <= ${
      moment(filters.value.dates.end).endOf('day').valueOf()
    })`
  );
  if(filters.value.id) {
    qs.push(
      `"goods_id" =  ${filters.value.id.value}`
    );
  }
  if(filters.value.type) {
    qs.push(
      `"goods_type" =  ${filters.value.type.value}`
    );
  }
  if(qs.length > 0) {
    sql += ` WHERE ${qs.join(' AND ')}`;
  }
  electron.each(sql).then(data => {
    items.value = Object.freeze(data);
  });
}

loadData();
</script>

<style>

</style>