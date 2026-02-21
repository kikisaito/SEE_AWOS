import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDatabaseService {
  static Database? _database;

  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  static Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'awos.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE crisis (
            id TEXT PRIMARY KEY,
            started_at TEXT NOT NULL,
            emotion TEXT NOT NULL,
            evaluation TEXT,
            breathing_completed INTEGER NOT NULL DEFAULT 0,
            is_synced INTEGER NOT NULL DEFAULT 0,
            reflection_pending INTEGER NOT NULL DEFAULT 1,
            reflection_trigger TEXT,
            reflection_location TEXT,
            reflection_company TEXT,
            reflection_substance TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )
        ''');
      },
    );
  }

  static Future<int> insertCrisis(Map<String, dynamic> crisis) async {
    final db = await database;
    return await db.insert(
      'crisis',
      crisis,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  static Future<int> updateCrisisReflection(
    String crisisId, {
    required String trigger,
    required String location,
    required String company,
    required String substance,
  }) async {
    final db = await database;
    return await db.update(
      'crisis',
      {
        'reflection_trigger': trigger,
        'reflection_location': location,
        'reflection_company': company,
        'reflection_substance': substance,
        'reflection_pending': 0,
      },
      where: 'id = ?',
      whereArgs: [crisisId],
    );
  }

  static Future<List<Map<String, dynamic>>> getUnsyncedCrises() async {
    final db = await database;
    return await db.query(
      'crisis',
      where: 'is_synced = ?',
      whereArgs: [0],
    );
  }

  static Future<int> markAsSynced(String crisisId) async {
    final db = await database;
    return await db.update(
      'crisis',
      {'is_synced': 1},
      where: 'id = ?',
      whereArgs: [crisisId],
    );
  }

  static Future<List<Map<String, dynamic>>> getAllCrises() async {
    final db = await database;
    return await db.query('crisis', orderBy: 'started_at DESC');
  }
}
