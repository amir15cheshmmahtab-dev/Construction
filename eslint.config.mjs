import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Feature components follow Nuxt's file-derived names, including index.vue.
    'vue/multi-word-component-names': 'off',
    // Match Prettier's Vue template output for void elements such as img/input.
    'vue/html-self-closing': [
      'error',
      {
        html: { void: 'always', normal: 'always', component: 'always' },
        svg: 'always',
        math: 'always',
      },
    ],
  },
})
