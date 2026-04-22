import { Button, Group, Modal, Select, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import i18n from "i18next";
import { useTranslation } from "react-i18next";

type SettingsDialogProps = {
  opened: boolean;
  onClose: () => void;
};

const LANG_KEY = "lang";

export default function SettingDialog(p: SettingsDialogProps) {
  const { t } = useTranslation();
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    if (!p.opened) return;

    const saved = localStorage.getItem(LANG_KEY) || i18n.language || "en";
    setLang(saved);
  }, [p.opened]);

  const handleSave = async () => {
    localStorage.setItem(LANG_KEY, lang);
    await i18n.changeLanguage(lang);
    p.onClose();
  };

  const handleCancel = () => {
    const saved = localStorage.getItem(LANG_KEY) || i18n.language || "en";
    setLang(saved);
    p.onClose();
  };

  if (!p.opened) return null;

  return (
    <Modal
      size="md"
      opened={p.opened}
      onClose={handleCancel}
      title={t("settings.title")}
      centered
    >
      <Stack>
        <Select
          label={t("settings.language")}
          placeholder={t("settings.languagePlaceholder")}
          value={lang}
          onChange={(value) => {
            if (value) setLang(value);
          }}
          data={[
            { value: "en", label: t("settings.languages.en") },
            { value: "hu", label: t("settings.languages.hu") },
          ]}
          allowDeselect={false}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleCancel}>
            {t("common.cancel")}
          </Button>

          <Button onClick={handleSave}>
            {t("common.save")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}