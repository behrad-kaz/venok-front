// components/dashboard/widget/WidgetFormTab.tsx

"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Edit2, Trash2, Plus } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  description: string;
  department: string;
  isActive: boolean;
  order: number;
}

interface FormSettings {
  title: string;
  description: string;
  subjectLabel: string;
  phonePlaceholder: string;
  descriptionPlaceholder: string;
  buttonText: string;
  successMessage: string;
  invalidPhoneMessage: string;
  requiredFieldsMessage: string;
  sendingMessage: string;
  privacyText: string;
  showDescriptionField: boolean;
  descriptionRequired: boolean;
  showSubjectField: boolean;
  showPrivacyText: boolean;
}

interface WidgetFormTabProps {
  onSave: () => void;
  onReset: () => void;
  onHasChangesChange?: (hasChanges: boolean) => void;
}

// داده‌های اولیه
const initialTopics: Topic[] = [
  {
    id: "1",
    title: "مشکل پرداخت",
    description: "موارد مالی و پرداخت",
    department: "مالی",
    isActive: true,
    order: 1,
  },
  {
    id: "2",
    title: "سوال قبل از خرید",
    description: "",
    department: "فروش",
    isActive: true,
    order: 2,
  },
  {
    id: "3",
    title: "پیگیری سفارش",
    description: "",
    department: "پشتیبانی",
    isActive: true,
    order: 3,
  },
  {
    id: "4",
    title: "سایر موارد",
    description: "",
    department: "پشتیبانی",
    isActive: true,
    order: 4,
  },
];

const initialFormSettings: FormSettings = {
  title: "چطور می‌تونیم کمکتون کنیم؟",
  description: "موضوع گفتگو را انتخاب کنید تا شما را به تیم مناسب وصل کنیم.",
  subjectLabel: "موضوع گفتگو",
  phonePlaceholder: "شماره همراه خود را وارد کنید",
  descriptionPlaceholder: "توضیحات بیشتر، اختیاری",
  buttonText: "شروع گفتگو",
  successMessage: "لینک گفتگو برای شما پیامک شد.",
  invalidPhoneMessage: "شماره همراه وارد شده معتبر نیست.",
  requiredFieldsMessage: "لطفاً تمام فیلدهای الزامی را پر کنید.",
  sendingMessage: "در حال ارسال لینک گفتگو...",
  privacyText: "با ارسال شماره همراه، شرایط و قوانین را می‌پذیرید.",
  showDescriptionField: true,
  descriptionRequired: false,
  showSubjectField: true,
  showPrivacyText: true,
};

const departments = ["پشتیبانی", "فروش", "مالی", "پیگیری سفارش"];

export default function WidgetFormTab({
  onSave,
  onReset,
  onHasChangesChange,
}: WidgetFormTabProps) {
  const [formSettings, setFormSettings] =
    useState<FormSettings>(initialFormSettings);
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // بررسی تغییرات
  useEffect(() => {
    const hasSettingsChanges =
      JSON.stringify(initialFormSettings) !== JSON.stringify(formSettings);
    const hasTopicsChanges =
      JSON.stringify(initialTopics) !== JSON.stringify(topics);
    onHasChangesChange?.(hasSettingsChanges || hasTopicsChanges);
  }, [formSettings, topics, onHasChangesChange]);

  const updateFormSetting = <K extends keyof FormSettings>(
    field: K,
    value: FormSettings[K],
  ) => {
    setFormSettings({ ...formSettings, [field]: value });
  };

  const toggleTopicStatus = (id: string) => {
    setTopics(
      topics.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)),
    );
  };

  const moveTopic = (id: string, direction: "up" | "down") => {
    const index = topics.findIndex((t) => t.id === id);
    if (direction === "up" && index > 0) {
      const newTopics = [...topics];
      [newTopics[index - 1], newTopics[index]] = [
        newTopics[index],
        newTopics[index - 1],
      ];
      setTopics(newTopics.map((t, i) => ({ ...t, order: i + 1 })));
    } else if (direction === "down" && index < topics.length - 1) {
      const newTopics = [...topics];
      [newTopics[index], newTopics[index + 1]] = [
        newTopics[index + 1],
        newTopics[index],
      ];
      setTopics(newTopics.map((t, i) => ({ ...t, order: i + 1 })));
    }
  };

  const deleteTopic = (id: string) => {
    setTopics(topics.filter((t) => t.id !== id));
  };

  const addNewTopic = () => {
    const newTopic: Topic = {
      id: Date.now().toString(),
      title: "موضوع جدید",
      description: "",
      department: departments[0],
      isActive: true,
      order: topics.length + 1,
    };
    setTopics([...topics, newTopic]);
    setEditingTopic(newTopic);
  };

  const saveTopic = (topic: Topic) => {
    if (editingTopic) {
      setTopics(topics.map((t) => (t.id === topic.id ? topic : t)));
    }
    setEditingTopic(null);
  };

  const handleReset = () => {
    setFormSettings(initialFormSettings);
    setTopics(initialTopics);
    onReset();
  };

  return (
    <div className="space-y-6">
      {/* تنظیمات فرم شروع گفتگو */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-base font-bold text-white mb-5">
          تنظیمات فرم شروع گفتگو
        </h3>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              عنوان فرم
            </label>
            <input
              type="text"
              value={formSettings.title}
              onChange={(e) => updateFormSetting("title", e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              متن توضیحی فرم
            </label>
            <textarea
              rows={2}
              value={formSettings.description}
              onChange={(e) => updateFormSetting("description", e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              متن انتخاب موضوع
            </label>
            <input
              type="text"
              value={formSettings.subjectLabel}
              onChange={(e) =>
                updateFormSetting("subjectLabel", e.target.value)
              }
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              متن placeholder شماره همراه
            </label>
            <input
              type="text"
              value={formSettings.phonePlaceholder}
              onChange={(e) =>
                updateFormSetting("phonePlaceholder", e.target.value)
              }
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              متن placeholder توضیحات
            </label>
            <input
              type="text"
              value={formSettings.descriptionPlaceholder}
              onChange={(e) =>
                updateFormSetting("descriptionPlaceholder", e.target.value)
              }
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              متن دکمه شروع گفتگو
            </label>
            <input
              type="text"
              value={formSettings.buttonText}
              onChange={(e) => updateFormSetting("buttonText", e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              پیام موفقیت بعد از ارسال شماره
            </label>
            <input
              type="text"
              value={formSettings.successMessage}
              onChange={(e) =>
                updateFormSetting("successMessage", e.target.value)
              }
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              پیام خطا برای شماره نامعتبر
            </label>
            <input
              type="text"
              value={formSettings.invalidPhoneMessage}
              onChange={(e) =>
                updateFormSetting("invalidPhoneMessage", e.target.value)
              }
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              پیام خطا برای فیلدهای اجباری
            </label>
            <input
              type="text"
              value={formSettings.requiredFieldsMessage}
              onChange={(e) =>
                updateFormSetting("requiredFieldsMessage", e.target.value)
              }
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              متن وضعیت ارسال لینک پیامکی
            </label>
            <input
              type="text"
              value={formSettings.sendingMessage}
              onChange={(e) =>
                updateFormSetting("sendingMessage", e.target.value)
              }
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              متن راهنمای حریم خصوصی / اعتماد
            </label>
            <input
              type="text"
              value={formSettings.privacyText}
              onChange={(e) => updateFormSetting("privacyText", e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div className="pt-3 border-t border-[rgba(255,255,255,0.1)] space-y-3">
            <h4 className="text-sm font-medium text-white mb-3">
              تنظیمات فیلدها
            </h4>

            <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
              <span className="text-sm font-medium text-white">
                نمایش فیلد توضیحات
              </span>
              <button
                type="button"
                onClick={() =>
                  updateFormSetting(
                    "showDescriptionField",
                    !formSettings.showDescriptionField,
                  )
                }
                className={`relative w-11 h-6 rounded-full transition-all ${formSettings.showDescriptionField ? "bg-[#59D8C3]" : "bg-gray-600"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${formSettings.showDescriptionField ? "right-0.5" : "left-0.5"}`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
              <span className="text-sm font-medium text-white">
                توضیحات اجباری است
              </span>
              <button
                type="button"
                onClick={() =>
                  updateFormSetting(
                    "descriptionRequired",
                    !formSettings.descriptionRequired,
                  )
                }
                className={`relative w-11 h-6 rounded-full transition-all ${formSettings.descriptionRequired ? "bg-[#59D8C3]" : "bg-gray-600"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${formSettings.descriptionRequired ? "right-0.5" : "left-0.5"}`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
              <span className="text-sm font-medium text-white">
                نمایش انتخاب موضوع
              </span>
              <button
                type="button"
                onClick={() =>
                  updateFormSetting(
                    "showSubjectField",
                    !formSettings.showSubjectField,
                  )
                }
                className={`relative w-11 h-6 rounded-full transition-all ${formSettings.showSubjectField ? "bg-[#59D8C3]" : "bg-gray-600"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${formSettings.showSubjectField ? "right-0.5" : "left-0.5"}`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
              <span className="text-sm font-medium text-white">
                نمایش پیام حریم خصوصی
              </span>
              <button
                type="button"
                onClick={() =>
                  updateFormSetting(
                    "showPrivacyText",
                    !formSettings.showPrivacyText,
                  )
                }
                className={`relative w-11 h-6 rounded-full transition-all ${formSettings.showPrivacyText ? "bg-[#59D8C3]" : "bg-gray-600"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${formSettings.showPrivacyText ? "right-0.5" : "left-0.5"}`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* اتصال موضوع‌ها به دپارتمان‌ها */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">
            اتصال موضوع‌ها به دپارتمان‌ها
          </h3>
          <button
            onClick={addNewTopic}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن موضوع جدید</span>
          </button>
        </div>

        <div className="space-y-3">
          {topics.map((topic, index) => (
            <div
              key={topic.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]"
            >
              {/* دکمه‌های جابجایی */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveTopic(topic.id, "up")}
                  disabled={index === 0}
                  className="text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveTopic(topic.id, "down")}
                  disabled={index === topics.length - 1}
                  className="text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* اطلاعات موضوع */}
              <div className="flex-1">
                {editingTopic?.id === topic.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingTopic.title}
                      onChange={(e) =>
                        setEditingTopic({
                          ...editingTopic,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3]"
                    />
                    <input
                      type="text"
                      value={editingTopic.description}
                      onChange={(e) =>
                        setEditingTopic({
                          ...editingTopic,
                          description: e.target.value,
                        })
                      }
                      placeholder="توضیحات (اختیاری)"
                      className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3]"
                    />
                    <select
                      value={editingTopic.department}
                      onChange={(e) =>
                        setEditingTopic({
                          ...editingTopic,
                          department: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2359D8C3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "left 0.75rem center",
                        backgroundSize: "14px",
                      }}
                    >
                      {departments.map((dept) => (
                        <option
                          key={dept}
                          value={dept}
                          className="bg-[#0D1B17] text-white"
                        >
                          {dept}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveTopic(editingTopic)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#59D8C3] text-[#06110F]"
                      >
                        ذخیره
                      </button>
                      <button
                        onClick={() => setEditingTopic(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgba(255,255,255,0.03)] text-gray-500"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium text-white">
                        {topic.title}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded bg-[rgba(89,216,195,0.08)] text-[#59D8C3] border border-[rgba(89,216,195,0.15)]">
                        {topic.department}
                      </span>
                    </div>
                    {topic.description && (
                      <p className="text-xs text-gray-500">
                        {topic.description}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* وضعیت فعال/غیرفعال */}
              {!editingTopic && (
                <button
                  onClick={() => toggleTopicStatus(topic.id)}
                  className={`relative w-11 h-6 rounded-full transition-all ${topic.isActive ? "bg-[#59D8C3]" : "bg-gray-600"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${topic.isActive ? "right-0.5" : "left-0.5"}`}
                  />
                </button>
              )}

              {/* دکمه‌های عملیات */}
              {!editingTopic && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingTopic(topic)}
                    className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-[rgba(255,107,107,0.08)] transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* دکمه‌های اقدام */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          className="px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all"
        >
          ذخیره تنظیمات
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
        >
          بازگشت به پیش‌فرض
        </button>
      </div>
    </div>
  );
}
