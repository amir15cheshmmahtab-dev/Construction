<script setup lang="ts">
import { ArrowUp } from 'lucide-vue-next'
import { brand } from '~/data/home'
</script>

<template>
  <footer id="about" class="site-footer page-container">
    <div><SharedBrandLogo small /><span>همراه شما، از اولین آجر تا آخرین جزئیات.</span></div>
    <p id="contact">
      نسخه نمایشی {{ brand.name }} <span aria-hidden="true">·</span> آغاز مسیر از تهران
    </p>
    <a href="#main-content"
      >بازگشت به بالا<ArrowUp :size="16" :stroke-width="1.5" aria-hidden="true"
    /></a>
  </footer>
</template>
