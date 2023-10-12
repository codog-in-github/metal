<template>
  <va-layout
    :style="{ height: '100vh' }"
    :left="{ absolute: true }"
  >
    <template #left>
      <va-sidebar
        hoverable
        :minimized="minimized"
        minimized-width="64px"
      >
        <template
          v-for="item in items"
          :key="item.title"
        >
          <va-sidebar-item
            :active="route.path === item.path"
            @click="router.push(item.path)"
          >
            <va-sidebar-item-content>
              <span :class="['icon', 'icon-' + item.icon]"></span>
              <va-sidebar-item-title>
                {{ item.title }}
              </va-sidebar-item-title>
            </va-sidebar-item-content>
          </va-sidebar-item>
        </template>
      </va-sidebar>
    </template>
    <div :style="{ marginLeft: '64px', padding: '10px' }">
      <router-view></router-view>
    </div>
  </va-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const minimized = ref(false);
const items = [
  { title: '交易录入', path: '/', icon: 'cash' },
  { title: '统计', path: '/chart', icon: 'chart' },
];

</script>

<style lang="scss">
</style>
