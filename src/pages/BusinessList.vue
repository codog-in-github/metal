<template>
  <va-data-table :items="items" :columns="columns" striped>
    <template #header(create_time)>
      <va-date-input
        label="时间"
        v-model="filters.dates"
        style="width: 190px"
      />
    </template>
    <template #header(goods_id)>
      <va-select
        label="商品类型"
        style="width: 130px"
        v-model="filters.id"
        :options="goodsIdOptions"
      ></va-select>
    </template>
    <template #header(goods_type)>
      <va-select
        label="期货类型"
        v-model="filters.type"
        style="width: 130px"
        :options="goodsTypeOptions"
      ></va-select>
    </template>
    <template v-slot:cell(create_time)="{ value }" >{{ fmtDate(value) }}</template>
    <template v-slot:cell(goods_id)="{ value }" >{{ goodsIdName(value) }}</template>
    <template v-slot:cell(goods_type)="{ value }" >{{ goodsTypeName(value) }}</template>
    <template v-slot:cell(total)="{ value }" >
      <span v-if="value < 0" style="color: red;">{{ -value }}</span>
      <span v-else style="color: green;">{{ value }}</span>
    </template>
  </va-data-table>
</template>

<script setup>
import { ref } from 'vue';
import moment from 'moment';
import { GOODS_ID_IMPURE, GOODS_ID_PURE, GOODS_TYPE_FUTURES, GOODS_TYPE_SPOT } from '@/constant';

const sql = 'SELECT * FROM "business" WHERE 1 = 1';
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
  electron.each(sql).then(data => {
    items.value = Object.freeze(data);
  });
}

loadData();
</script>

<style>

</style>