import { doInTenant, getTenantIDFromCtx } from "../tenancy"
import { buildMatcherRegex, matches } from "./matchers"
import { Header } from "../constants"
import {
  BBContext,
  EndpointMatcher,
  GetTenantIdOptions,
  TenantResolutionStrategy,
} from "@budibase/types"

const tenancy = (
  allowQueryStringPatterns: EndpointMatcher[],
  noTenancyPatterns: EndpointMatcher[],
  opts = { noTenancyRequired: false }
) => {
  const allowQsOptions = buildMatcherRegex(allowQueryStringPatterns)
  const noTenancyOptions = buildMatcherRegex(noTenancyPatterns)

  return async function (ctx: BBContext, next: any) {
    const allowNoTenant =
      opts.noTenancyRequired || !!matches(ctx, noTenancyOptions)
    const tenantOpts: GetTenantIdOptions = {
      allowNoTenant,
    }

    const allowQs = !!matches(ctx, allowQsOptions)
    if (!allowQs) {
      tenantOpts.excludeStrategies = [TenantResolutionStrategy.QUERY]
    }

    const tenantId = getTenantIDFromCtx(ctx, tenantOpts)
    ctx.set(Header.TENANT_ID, tenantId as string)
    return doInTenant(tenantId, next)
  }
}

export = tenancy
