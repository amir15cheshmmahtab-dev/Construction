<script setup lang="ts">
import { brand } from '~/data/home'
</script>

<template>
  <footer id="about" class="site-footer page-container">
    <div><SharedBrandLogo small /><span>همراه شما، از اولین آجر تا آخرین جزئیات.</span></div>
    <p id="contact">
      نسخه نمایشی {{ brand.name }} <span aria-hidden="true">·</span> آغاز مسیر از تهران
    </p>
    <a href="#main-content">بازگشت به بالا ↑</a>
  </footer>
</template>
