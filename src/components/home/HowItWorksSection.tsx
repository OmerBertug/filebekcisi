// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { Calculator, MapPin, Send, type LucideIcon } from 'lucide-react';
import type { AppDictionary } from '@/i18n';

/**
 * Props accepted by the `HowItWorksSection` informational component.
 */
export interface HowItWorksSectionProps {
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
}

interface WorkflowStepCardProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
}

/**
 * Single hairline-bordered cell representing one sequential stage of the brokerage workflow.
 *
 * @param props - `WorkflowStepCardProps` containing step icon, title, and description.
 * @returns Rendered step column cell.
 */
function WorkflowStepCard({
  icon: Icon,
  title,
  description,
}: WorkflowStepCardProps): React.JSX.Element {
  return (
    <div className="bg-white/70 p-6 transition hover:bg-white sm:p-10">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-none border border-[#DCDCE2] bg-[#F8F8FA] text-[#161540]">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <h3 className="mt-6 text-base font-normal tracking-wide text-[#161540]">{title}</h3>
      <p className="mt-3 text-sm font-light leading-relaxed text-[#636262]">{description}</p>
    </div>
  );
}

/**
 * Three-step horizontal architectural grid explainer detailing district filtering, commission
 * transparency, and formal match invitation dispatch.
 *
 * @param props - `HowItWorksSectionProps` containing localized step titles and descriptions.
 * @returns Rendered workflow `<section>` element.
 */
export function HowItWorksSection({ dictionary }: HowItWorksSectionProps): React.JSX.Element {
  return (
    <section id="how-it-works" className="border-b border-[#DCDCE2] bg-[#F8F8FA]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-6">
        <div className="border-b border-[#DCDCE2] px-4 py-8 sm:px-8 lg:col-span-1 lg:border-r lg:border-b-0 lg:py-12">
          <span className="block text-[11px] font-light tracking-[0.18em] text-[#636262] uppercase">
            02
          </span>
          <h2 className="mt-2 text-sm font-light tracking-[0.14em] text-[#161540] uppercase">
            {dictionary.howItWorks.sectionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 divide-y divide-[#DCDCE2] md:grid-cols-3 md:divide-x md:divide-y-0 lg:col-span-5">
          <WorkflowStepCard
            icon={MapPin}
            title={dictionary.howItWorks.step1Title}
            description={dictionary.howItWorks.step1Desc}
          />
          <WorkflowStepCard
            icon={Calculator}
            title={dictionary.howItWorks.step2Title}
            description={dictionary.howItWorks.step2Desc}
          />
          <WorkflowStepCard
            icon={Send}
            title={dictionary.howItWorks.step3Title}
            description={dictionary.howItWorks.step3Desc}
          />
        </div>
      </div>
    </section>
  );
}
