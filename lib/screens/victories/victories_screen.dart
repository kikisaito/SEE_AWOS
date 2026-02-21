import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/victory_provider.dart';
import '../../widgets/app_drawer.dart';

class VictoriesScreen extends StatefulWidget {
  const VictoriesScreen({super.key});

  @override
  State<VictoriesScreen> createState() => _VictoriesScreenState();
}

class _VictoriesScreenState extends State<VictoriesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<VictoryProvider>().loadAll();
    });
  }

  void _showAddDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nueva Victoria'),
        content: TextField(
          controller: controller,
          autofocus: true,
          maxLength: 60,
          decoration: const InputDecoration(
            hintText: 'Ej: Leí 10 páginas',
            labelText: '¿Qué logro quieres registrar?',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              final name = controller.text.trim();
              if (name.isNotEmpty) {
                context.read<VictoryProvider>().addDefinition(name);
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Victoria añadida'),
                    backgroundColor: Color(0xFF22C55E),
                    duration: Duration(seconds: 1),
                  ),
                );
              }
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  void _showOptionsSheet(VictoryDefinition def) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Wrap(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Text(
                def.name,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.edit, color: Color(0xFF5EEAD4)),
              title: const Text('Cambiar nombre'),
              onTap: () {
                Navigator.pop(ctx);
                _showEditDialog(def);
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete, color: Color(0xFFEF4444)),
              title: const Text('Eliminar'),
              onTap: () {
                Navigator.pop(ctx);
                _confirmDelete(def);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showEditDialog(VictoryDefinition def) {
    final controller = TextEditingController(text: def.name);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Editar Victoria'),
        content: TextField(
          controller: controller,
          autofocus: true,
          maxLength: 60,
          decoration: const InputDecoration(labelText: 'Nombre'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              final name = controller.text.trim();
              if (name.isNotEmpty) {
                context.read<VictoryProvider>().updateDefinition(def.id, name);
                Navigator.pop(ctx);
              }
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(VictoryDefinition def) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar Victoria'),
        content: Text('¿Eliminar "${def.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
            ),
            onPressed: () {
              context.read<VictoryProvider>().deleteDefinition(def.id);
              Navigator.pop(ctx);
            },
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<VictoryProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Victorias'),
        actions: const [AppDrawerButton()],
      ),
      endDrawer: const AppDrawer(),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Registra una victoria hoy',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Marca las acciones positivas que completaste',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  Card(
                    child: Column(
                      children: [
                        ...provider.definitions.map((def) {
                          final isChecked =
                              provider.todayChecked.contains(def.id);
                          return GestureDetector(
                            onLongPress: () => _showOptionsSheet(def),
                            child: CheckboxListTile(
                              title: Text(def.name),
                              value: isChecked,
                              onChanged: (value) {
                                provider.toggleCheck(def.id);
                                if (value == true) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('¡Bien hecho! 🎉'),
                                      backgroundColor: Color(0xFF22C55E),
                                      duration: Duration(seconds: 1),
                                    ),
                                  );
                                }
                              },
                              secondary: Icon(
                                isChecked
                                    ? Icons.check_circle
                                    : Icons.circle_outlined,
                                color: isChecked
                                    ? const Color(0xFF22C55E)
                                    : Theme.of(context).colorScheme.primary,
                              ),
                            ),
                          );
                        }),
                        const Divider(height: 1),
                        TextButton.icon(
                          onPressed: _showAddDialog,
                          icon: const Icon(Icons.add),
                          label: const Text('Añadir nueva victoria'),
                        ),
                        const SizedBox(height: 4),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  const Divider(),
                  const SizedBox(height: 16),
                  Text(
                    'Historial',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 16),
                  provider.history.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(32.0),
                            child: Text(
                              'No hay victorias registradas aún',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ),
                        )
                      : ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: provider.history.length,
                          separatorBuilder: (context, index) =>
                              const SizedBox(height: 8),
                          itemBuilder: (context, index) {
                            final log = provider.history[index];
                            return _VictoryCard(log: log);
                          },
                        ),
                ],
              ),
            ),
    );
  }
}

class _VictoryCard extends StatelessWidget {
  final VictoryLog log;

  const _VictoryCard({required this.log});

  String _formatDate(String dateStr) {
    final date = DateTime.tryParse(dateStr);
    if (date == null) return dateStr;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final logDate = DateTime(date.year, date.month, date.day);
    final diff = today.difference(logDate).inDays;
    if (diff == 0) return 'Hoy';
    if (diff == 1) return 'Ayer';
    if (diff < 7) return 'Hace $diff días';
    return DateFormat('dd/MM/yyyy').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFF5EEAD4).withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            Icons.emoji_events,
            color: Color(0xFF5EEAD4),
          ),
        ),
        title: Text(
          log.name,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        subtitle: Text(_formatDate(log.loggedDate)),
      ),
    );
  }
}
