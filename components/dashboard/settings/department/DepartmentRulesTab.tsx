// components/dashboard/settings/department/DepartmentRulesTab.tsx

"use client";

interface DepartmentRulesTabProps {
  routingRule: string;
  onRoutingRuleChange: (rule: string) => void;
}

interface RuleOption {
  id: string;
  title: string;
  description: string;
  disabled?: boolean;
}

const ruleOptions: RuleOption[] = [
  {
    id: "queue",
    title: "گفتگوهای جدید مستقیم وارد صف دپارتمان شوند",
    description: "تمام گفتگوها در صف عمومی دپارتمان قرار می‌گیرند و اعضا می‌توانند آن‌ها را مشاهده کنند",
  },
  {
    id: "manager-first",
    title: "گفتگوهای جدید ابتدا برای مدیر دپارتمان نمایش داده شوند",
    description: "مدیر دپارتمان گفتگوها را بررسی و به اعضای مناسب تخصیص می‌دهد",
  },
  {
    id: "manual-assignment",
    title: "تخصیص دستی توسط مدیر دپارتمان",
    description: "هر گفتگو باید توسط مدیر به یک عضو خاص اختصاص داده شود",
  },
  {
    id: "auto-online",
    title: "تخصیص خودکار به اعضای آنلاین",
    description: "گفتگوها به صورت خودکار بین اعضای آنلاین توزیع می‌شوند (قابلیت آینده)",
    disabled: true,
  },
];

export default function DepartmentRulesTab({ routingRule, onRoutingRuleChange }: DepartmentRulesTabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-white mb-2">قوانین ورود گفتگو</h3>
      <p className="text-sm text-gray-500 mb-5">این قوانین مشخص می‌کنند گفتگوهای ورودی دپارتمان چگونه بین تیم مدیریت شوند.</p>
      <div className="space-y-3">
        {ruleOptions.map((option) => (
          <label
            key={option.id}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
              option.disabled
                ? "bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.1)] opacity-50 cursor-not-allowed"
                : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)] cursor-pointer hover:border-[rgba(255,255,255,0.2)]"
            }`}
          >
            <input
              type="radio"
              name="routingRule"
              className="mt-0.5"
              disabled={option.disabled}
              checked={routingRule === option.id}
              onChange={() => onRoutingRuleChange(option.id)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{option.title}</p>
                {option.disabled && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(255,255,255,0.05)] text-gray-500 border border-[rgba(255,255,255,0.1)]">
                    به‌زودی
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}