import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../services/mock_api_service.dart';

class CreateCapsuleScreen extends StatefulWidget {
  const CreateCapsuleScreen({super.key});

  @override
  State<CreateCapsuleScreen> createState() => _CreateCapsuleScreenState();
}

class _CreateCapsuleScreenState extends State<CreateCapsuleScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  int? _selectedEmotionId;
  bool _isLoading = false;

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedEmotionId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor selecciona una emoción')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final apiService = MockApiService();
      await apiService.createCapsule(
        title: _titleController.text.trim(),
        content: _contentController.text.trim(),
        emotionId: _selectedEmotionId!,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cápsula creada exitosamente'),
            backgroundColor: Color(0xFF22C55E),
            duration: Duration(seconds: 2),
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al crear cápsula: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final dataProvider = context.watch<DataProvider>();
    final emotions = dataProvider.emotions;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nueva Cápsula'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                Icons.lightbulb,
                size: 64,
                color: Color(0xFF5EEAD4),
              ),
              const SizedBox(height: 24),
              Text(
                'Crea tu cápsula personalizada',
                style: Theme.of(context).textTheme.displaySmall,
              ),
              const SizedBox(height: 8),
              Text(
                'Escribe contenido que te ayude en momentos difíciles',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 32),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Título',
                  hintText: 'Ej: Mi afirmación diaria',
                  prefixIcon: Icon(Icons.title),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'El título es requerido';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _contentController,
                minLines: 4,
                maxLines: 8,
                decoration: const InputDecoration(
                  labelText: 'Contenido',
                  hintText: 'Escribe el contenido de tu cápsula...',
                  prefixIcon: Icon(Icons.notes),
                  alignLabelWithHint: true,
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'El contenido es requerido';
                  }
                  if (value.trim().length < 10) {
                    return 'El contenido debe tener al menos 10 caracteres';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<int>(
                value: _selectedEmotionId,
                decoration: const InputDecoration(
                  labelText: 'Emoción asociada',
                  prefixIcon: Icon(Icons.favorite),
                ),
                hint: const Text('Selecciona una emoción'),
                items: emotions.map((emotion) {
                  return DropdownMenuItem<int>(
                    value: emotion.id,
                    child: Text(emotion.name),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedEmotionId = value;
                  });
                },
                validator: (value) {
                  if (value == null) {
                    return 'Por favor selecciona una emoción';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleSave,
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Guardar Cápsula'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
