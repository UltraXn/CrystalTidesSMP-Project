package com.crystaltides.core.commands;

import com.crystaltides.core.CrystalCore;
import com.crystaltides.core.modules.MarketplaceModule;
import com.crystaltides.core.modules.MarketplaceModule.MarketItem;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.event.ClickEvent;
import net.kyori.adventure.text.event.HoverEvent;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.format.TextDecoration;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class BolsaCommand implements CommandExecutor, TabCompleter {

    private final CrystalCore plugin;

    public BolsaCommand(CrystalCore plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("§cSolo los jugadores pueden acceder a la bolsa de valores.");
            return true;
        }

        Player player = (Player) sender;
        MarketplaceModule market = plugin.getModuleManager().getModule(MarketplaceModule.class);

        if (market == null || !market.isEnabled()) {
            player.sendMessage(Component.text("❌ El mercado dinámico no está disponible actualmente.", NamedTextColor.RED));
            return true;
        }

        if (args.length == 0 || args[0].equalsIgnoreCase("ver") || args[0].equalsIgnoreCase("list")) {
            displayMarketOverview(player, market);
            return true;
        }

        String sub = args[0].toLowerCase(Locale.ROOT);

        if (sub.equals("sell") || sub.equals("vender")) {
            if (args.length < 2) {
                player.sendMessage(Component.text("Uso: /bolsa sell <recurso> [cantidad]", NamedTextColor.RED));
                return true;
            }
            MarketItem item = market.getItem(args[1]);
            if (item == null) {
                player.sendMessage(Component.text("❌ Recurso no válido. Usa /bolsa para ver el catálogo.", NamedTextColor.RED));
                return true;
            }
            int amount = 1;
            if (args.length >= 3) {
                try {
                    amount = Integer.parseInt(args[2]);
                } catch (NumberFormatException e) {
                    player.sendMessage(Component.text("❌ Cantidad inválida.", NamedTextColor.RED));
                    return true;
                }
            }
            market.sellItem(player, item, amount);
            return true;
        }

        if (sub.equals("buy") || sub.equals("comprar")) {
            if (args.length < 2) {
                player.sendMessage(Component.text("Uso: /bolsa buy <recurso> [cantidad]", NamedTextColor.RED));
                return true;
            }
            MarketItem item = market.getItem(args[1]);
            if (item == null) {
                player.sendMessage(Component.text("❌ Recurso no válido. Usa /bolsa para ver el catálogo.", NamedTextColor.RED));
                return true;
            }
            int amount = 1;
            if (args.length >= 3) {
                try {
                    amount = Integer.parseInt(args[2]);
                } catch (NumberFormatException e) {
                    player.sendMessage(Component.text("❌ Cantidad inválida.", NamedTextColor.RED));
                    return true;
                }
            }
            market.buyItem(player, item, amount);
            return true;
        }

        player.sendMessage(Component.text("Uso: /bolsa [ver|sell|buy] [recurso] [cantidad]", NamedTextColor.YELLOW));
        return true;
    }

    private void displayMarketOverview(Player player, MarketplaceModule market) {
        player.sendMessage(Component.text("══════════ ", NamedTextColor.DARK_AQUA)
                .append(Component.text("📈 BOLSA DE RECURSOS CRYSTALTIDES", NamedTextColor.GOLD, TextDecoration.BOLD))
                .append(Component.text(" ══════════", NamedTextColor.DARK_AQUA)));
        player.sendMessage(Component.text("Los precios fluctúan según la oferta y demanda de los jugadores.", NamedTextColor.GRAY));

        for (MarketItem item : market.getCatalog().values()) {
            Component line = Component.text("• ", NamedTextColor.DARK_GRAY)
                    .append(Component.text(item.getDisplayName() + " ", NamedTextColor.WHITE, TextDecoration.BOLD))
                    .append(Component.text(String.format(Locale.US, "[%.2f KC] ", item.getCurrentPrice()), NamedTextColor.GOLD))
                    .append(Component.text("[VENDER]", NamedTextColor.GREEN, TextDecoration.BOLD)
                            .hoverEvent(HoverEvent.showText(Component.text("Click para vender 1x " + item.getDisplayName())))
                            .clickEvent(ClickEvent.runCommand("/bolsa sell " + item.getId() + " 1")))
                    .append(Component.text(" "))
                    .append(Component.text("[COMPRAR]", NamedTextColor.AQUA, TextDecoration.BOLD)
                            .hoverEvent(HoverEvent.showText(Component.text("Click para comprar 1x " + item.getDisplayName())))
                            .clickEvent(ClickEvent.runCommand("/bolsa buy " + item.getId() + " 1")));
            player.sendMessage(line);
        }
        player.sendMessage(Component.text("═══════════════════════════════════════════", NamedTextColor.DARK_AQUA));
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        List<String> suggestions = new ArrayList<>();
        MarketplaceModule market = plugin.getModuleManager().getModule(MarketplaceModule.class);

        if (args.length == 1) {
            suggestions.add("ver");
            suggestions.add("sell");
            suggestions.add("buy");
        } else if (args.length == 2 && (args[0].equalsIgnoreCase("sell") || args[0].equalsIgnoreCase("buy"))) {
            if (market != null) {
                suggestions.addAll(market.getCatalog().keySet());
            }
        } else if (args.length == 3) {
            suggestions.add("1");
            suggestions.add("16");
            suggestions.add("64");
        }
        return suggestions;
    }
}
