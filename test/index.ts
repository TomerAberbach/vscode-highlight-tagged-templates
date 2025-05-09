import { expect, expectTypeOf, test } from 'vitest'
import vscodeHighlightTaggedTemplates from '../src/index.ts'

test(`vscodeHighlightTaggedTemplates works`, () => {
  expectTypeOf(vscodeHighlightTaggedTemplates).toEqualTypeOf<() => string>()
  expect(vscodeHighlightTaggedTemplates()).toBe(`Hello World!`)
})
