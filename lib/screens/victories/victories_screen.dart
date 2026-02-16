import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/data_provider.dart';
import '../../services/mock_api_service.dart';
import '../../models/victory.dart';

class VictoriesScreen extends StatefulWidget {
  const VictoriesScreen({super.key});

  @override
  State<VictoriesScreen> createState() => _VictoriesScreenState();
}

class _VictoriesScreenState extends State<VictoriesScreen> {
  final MockApiService _apiService = MockApiService();
  List<Victory> _victories = [];
  bool _isLoading = false;
  final Set<String> _registeredToday = {};

  @override
  void initState() {
    super.initState();
    _loadVictories();
  }

  Future<void> _loadVictories() async {
    setState(() => _isLoading = true);

    try {
      final victories = await _apiService.getMyVictories();
      setState(() {
        _victories = victories;
        // Mark victories registered today
        final today = DateTime.now();
        for (var victory in victories) {
          if (victory.occurredAt.year == today.year &&
              victory.occurredAt.month == today.month &&
              victory.occurredAt.day == today.day) {
            _registeredToday.add(victory.name);
          }
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar victorias: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _registerVictory(String victoryTypeName) async {
    if (_registeredToday.contains(victoryTypeName)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ya registraste esta victoria hoy')),
      );
      return;
    }

    try {
      final victory = await _apiService.createVictory(
        victoryTypeName,
        DateTime.now(),
      );

      setState(() {
        _victories.insert(0, victory);
        _registeredToday.add(victoryTypeName);
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('¡Bien hecho! 🎉'),
            backgroundColor: Color(0xFF22C55E),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final dataProvider = context.watch<DataProvider>();
    final victoryTypes = dataProvider.victoryTypes;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Victorias'),
      ),
      body: _isLoading
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
                      children: victoryTypes.map((type) {
                        final isRegistered =
                            _registeredToday.contains(type.name);
                        return CheckboxListTile(
                          title: Text(type.name),
                          value: isRegistered,
                          onChanged: (value) {
                            if (value == true) {
                              _registerVictory(type.name);
                            }
                          },
                          secondary: Icon(
                            isRegistered
                                ? Icons.check_circle
                                : Icons.circle_outlined,
                            color: isRegistered
                                ? const Color(0xFF22C55E)
                                : Theme.of(context).colorScheme.primary,
                          ),
                        );
                      }).toList(),
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
                  _victories.isEmpty
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
                          itemCount: _victories.length,
                          separatorBuilder: (context, index) =>
                              const SizedBox(height: 8),
                          itemBuilder: (context, index) {
                            final victory = _victories[index];
                            return _VictoryCard(victory: victory);
                          },
                        ),
                ],
              ),
            ),
    );
  }
}

class _VictoryCard extends StatelessWidget {
  final Victory victory;

  const _VictoryCard({required this.victory});

  String _getRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        return 'Hace ${difference.inMinutes} minutos';
      }
      return 'Hace ${difference.inHours} horas';
    } else if (difference.inDays == 1) {
      return 'Ayer';
    } else if (difference.inDays < 7) {
      return 'Hace ${difference.inDays} días';
    } else {
      return DateFormat('dd/MM/yyyy').format(dateTime);
    }
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
          victory.name,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        subtitle: Text(_getRelativeTime(victory.occurredAt)),
      ),
    );
  }
}
