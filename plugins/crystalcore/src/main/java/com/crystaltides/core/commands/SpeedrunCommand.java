package com.crystaltides.core.commands;

import com.crystaltides.core.CrystalCore;
import com.crystaltides.core.modules.DungeonSpeedrunModule;
import com.crystaltides.core.modules.DungeonSpeedrunModule.DungeonRecord;
import com.crystaltides.core.modules.DungeonSpeedrunModule.SpeedrunAttempt;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.format.TextDecoration;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;

import java.util.ArrayList;
import java.util.List;

public class SpeedrunCommand implements CommandExecutor, TabCompleter {

    private final CrystalCore plugin;

    public SpeedrunCommand(CrystalCore plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("§cSolo los jugadores pueden usar el sistema de speedruns.");
            return true;
        }

        Player player = (Player) sender;
        DungeonSpeedrunModule speedrun = plugin.getModuleManager().getModule(DungeonSpeedrunModule.class);

        if (speedrun == null || !speedrun.isEnabled()) {
            player.sendMessage(Component.text("❌ El sistema de Speedruns no está habilitado.", NamedTextColor.RED));
            return true;
        }

        if (args.length == 0 || args[0].equalsIgnoreCase("status")) {
            SpeedrunAttempt attempt = speedrun.getAttempt(player.getUniqueId());
            if (attempt != null) {
                player.sendMessage(Component.text("⏱️ Speedrun activo: ", NamedTextColor.AQUA)
                        .append(Component.text(attempt.getDungeonId(), NamedTextColor.GOLD, TextDecoration.BOLD))
                        .append(Component.text(" | Tiempo transcurrido: ", NamedTextColor.GRAY))
                        .append(Component.text(attempt.getFormattedTime(), NamedTextColor.GREEN, TextDecoration.BOLD)));
            } else {
                player.sendMessage(Component.text("ℹ️ No tienes ningún intento de speedrun activo.", NamedTextColor.GRAY));
                player.sendMessage(Component.text("Uso: /speedrun [start|complete|cancel|top] <mazmorra>", NamedTextColor.YELLOW));
            }
            return true;
        }

        String sub = args[0].toLowerCase();

        if (sub.equals("start") || sub.equals("iniciar")) {
            String dungeon = (args.length >= 2) ? args[1] : "Trial_Chamber";
            speedrun.startAttempt(player, dungeon);
            return true;
        }

        if (sub.equals("complete") || sub.equals("completar")) {
            String dungeon = (args.length >= 2) ? args[1] : "Trial_Chamber";
            speedrun.completeAttempt(player, dungeon);
            return true;
        }

        if (sub.equals("cancel") || sub.equals("cancelar")) {
            speedrun.cancelAttempt(player);
            return true;
        }

        if (sub.equals("top") || sub.equals("leaderboard")) {
            String dungeon = (args.length >= 2) ? args[1] : "Trial_Chamber";
            player.sendMessage(Component.text("🏆 Consultando récords para: " + dungeon + "...", NamedTextColor.GRAY));
            speedrun.fetchTopRecords(dungeon, 5, records -> {
                player.sendMessage(Component.text("═════ ", NamedTextColor.DARK_PURPLE)
                        .append(Component.text("🏆 MEJORES TIEMPOS (" + dungeon + ")", NamedTextColor.GOLD, TextDecoration.BOLD))
                        .append(Component.text(" ═════", NamedTextColor.DARK_PURPLE)));
                if (records.isEmpty()) {
                    player.sendMessage(Component.text("No hay récords registrados todavía.", NamedTextColor.GRAY));
                } else {
                    for (int i = 0; i < records.size(); i++) {
                        DungeonRecord r = records.get(i);
                        player.sendMessage(Component.text("#" + (i + 1) + " ", NamedTextColor.YELLOW, TextDecoration.BOLD)
                                .append(Component.text(r.getPlayerName() + ": ", NamedTextColor.WHITE))
                                .append(Component.text(r.getFormattedTime(), NamedTextColor.GREEN, TextDecoration.BOLD)));
                    }
                }
                player.sendMessage(Component.text("═══════════════════════════════════", NamedTextColor.DARK_PURPLE));
            });
            return true;
        }

        player.sendMessage(Component.text("Uso: /speedrun [start|complete|cancel|top] <mazmorra>", NamedTextColor.YELLOW));
        return true;
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        List<String> suggestions = new ArrayList<>();
        if (args.length == 1) {
            suggestions.add("status");
            suggestions.add("start");
            suggestions.add("complete");
            suggestions.add("cancel");
            suggestions.add("top");
        } else if (args.length == 2) {
            suggestions.add("Trial_Chamber");
            suggestions.add("Cataclysm_Dungeon");
            suggestions.add("Deeper_Darker_Otherside");
            suggestions.add("End_Remastered_Citadel");
        }
        return suggestions;
    }
}
