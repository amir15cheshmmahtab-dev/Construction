<template>
  <div class="site-shell">
    <a class="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
    <LayoutAppHeader />
    <main id="main-content">
      <slot />
    </main>
    <LayoutAppFooter />
    <LayoutMobileNavigation />
    <SharedToastMessage />
  </div>
</template>
