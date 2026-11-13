<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { Project } from '~/types/home'
import { useUiStore } from '~/stores/ui'
defineProps<{ projects: Project[] }>()
const ui = useUiStore()
const { publicAsset, imageSrcset } = usePublicAssets()
</script>

<template>
  <section
    id="projects"
    class="projects-section page-container editorial-section"
    aria-labelledby="projects-title"
  >
    <UiSectionHeading
      id="projects-title"
      eyebrow="SHOP BY PROJECT"
      title="خرید بر اساس پروژه"
      description="با انتخاب نوع پروژه، بهترین محصولات و راهکارها را برای ساخت یا بازسازی خود پیدا کنید."
    >
      <UiBaseButton href="#project-cards">شروع کنید</UiBaseButton>
    </UiSectionHeading>
    <button
      class="mobile-section-link"
      type="button"
      @click="ui.notify('راهنمای انتخاب پروژه در مرحله بعد فعال می‌شود.')"
    >
      مشاهده همه<ArrowLeft :size="14" />
    </button>
    <div id="project-cards" class="project-track">
      <button
        v-for="project in projects"
        :key="project.id"
        type="button"
        class="project-card"
        @click="ui.notify(`راهنمای «${project.name}» در مرحله بعد در دسترس قرار می‌گیرد.`)"
      >
        <img
          :src="publicAsset(project.image)"
          :srcset="imageSrcset(project.image, [480, 900])"
          sizes="(max-width: 767px) 43vw, (max-width: 1023px) 22vw, 19vw"
          :alt="project.description"
          width="900"
          height="1125"
          loading="lazy"
          decoding="async"
        />
        <span class="project-card-shade" />
        <span class="project-card-label"
          ><span>{{ project.name }}</span
          ><i><ArrowLeft :size="19" :stroke-width="1.3" /></i
        ></span>
      </button>
    </div>
  </section>
</template>
