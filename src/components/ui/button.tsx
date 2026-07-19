import { View, type StyleProp, type ViewStyle } from "react-native";
import { IconName } from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { CustomPressableProps, PressableScale } from "pressto";
import { AppText, AppTextVariant } from "./app-text";
import { UniRemixIcon } from "./icon";
type ButtonVariant = "primary" | "secondary";

type ButtonProps = CustomPressableProps & {
  label: string;
  variant?: ButtonVariant;
  icon?: IconName;
  contentStyle?: StyleProp<ViewStyle>;
  labelVariant?: AppTextVariant;
};

const UniAppText = withUnistyles(AppText);

export const AppButton: React.FC<ButtonProps> = ({ label, variant = "primary", style, disabled, icon, contentStyle, labelVariant, ...rest }) => {
  return (
    <PressableScale style={style} {...rest}>
      <View style={[styles.content, contentStyle]}>
        {icon ? (
          <UniRemixIcon
            name={icon}
            size={22}
            uniProps={(theme: any) => ({
              color: variant === "primary" ? theme.colors.primaryText : theme.colors.primary,
            })}
          />
        ) : null}
        <UniAppText
          variant={labelVariant || "button"}
          uniProps={(theme) => ({
            color: variant === "primary" ? theme.colors.primaryText : undefined,
          })}
        >
          {label}
        </UniAppText>
      </View>
    </PressableScale>
  );
};

type IconButtonProps = CustomPressableProps & {
  icon: IconName;
  iconColor?: string;
  variant?: "primary" | "secondary";
};

export const IconButton: React.FC<IconButtonProps> = ({ icon, variant = "primary", style, iconColor, ...rest }) => {
  return (
    <PressableScale style={[styles.iconButtonBase, styles[variant], style]} {...rest}>
      <UniRemixIcon
        name={icon || "question-line"}
        size={22}
        uniProps={(theme: any) => ({
          color: iconColor || (variant === "primary" ? theme.colors.primaryText : theme.colors.primary),
        })}
      />
    </PressableScale>
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    height: 48,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  iconButtonBase: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.secondarySurface,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
}));
