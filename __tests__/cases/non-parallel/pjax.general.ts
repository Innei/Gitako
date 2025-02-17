import {
  collapseFloatModeSidebar,
  expandFloatModeSidebar,
  patientClick,
  selectFileTreeItem,
  sleep,
  waitForLegacyPJAXRedirect
} from '../../utils'

describe(`in Gitako project page`, () => {
  beforeAll(() => page.goto('https://github.com/EnixCoda/Gitako/tree/develop/src'))

  it('should work with PJAX', async () => {
    await sleep(3000)

    await expandFloatModeSidebar()
    await patientClick(selectFileTreeItem('src/analytics.ts'))
    await waitForLegacyPJAXRedirect()
    await collapseFloatModeSidebar()

    await page.click('a[data-selected-links^="repo_issues "]')
    await waitForLegacyPJAXRedirect()

    await page.click('a[data-selected-links^="repo_pulls "]')
    await waitForLegacyPJAXRedirect()

    page.goBack()
    await sleep(1000)

    page.goBack()
    await sleep(1000)

    expect(
      await page.evaluate(
        () => document.querySelector('.final-path')?.textContent === 'analytics.ts',
      ),
    ).toBe(true)
  })
})
