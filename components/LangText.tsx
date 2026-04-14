import { Text, TextProps } from 'react-native';

// RTL-aware text component.
// Applies correct writingDirection and textAlign based on the language of the content.
// Hebrew is RTL; English and Dutch are LTR.
// Use this for any text that displays user content in a specific language.

const RTL_LANGUAGES = new Set(['he', 'ar', 'fa', 'ur']);

interface LangTextProps extends TextProps {
  lang?: string;
}

export function LangText({ lang, style, ...props }: LangTextProps) {
  const isRtl = lang ? RTL_LANGUAGES.has(lang) : false;

  return (
    <Text
      style={[
        {
          writingDirection: isRtl ? 'rtl' : 'ltr',
          textAlign: isRtl ? 'right' : 'left',
        },
        style,
      ]}
      {...props}
    />
  );
}
